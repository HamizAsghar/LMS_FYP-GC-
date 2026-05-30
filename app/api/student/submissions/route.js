import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import AssignedClass from '@/models/AssignedClass';
import Submission from '@/models/Submission';
import Student from '@/models/Student';
import Class from '@/models/Class';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const submissions = await Submission.find({ student: authResult.user.id })
      .populate({
        path: 'assignment',
        select: 'title totalMarks deadline subject',
        populate: {
          path: 'course',
          select: 'subject section classId',
          populate: { path: 'classId', select: 'program className semester' }
        }
      })
      .sort({ submittedDate: -1 })
      .lean();

    // Enrich each submission with a stable `course.code` and `course.name`
    // derived from the AssignedClass → Class chain
    const enriched = submissions.map(s => {
      const assignment = s.assignment;
      if (assignment) {
        assignment.totalPoints = assignment.totalMarks;
        assignment.dueDate = assignment.deadline;
      }
      const assignedClass = assignment?.course;
      const classInfo = assignedClass?.classId;
      const subject = assignedClass?.subject || '';
      const section = assignedClass?.section || '';
      const program = classInfo?.program || '';
      const semester = classInfo?.semester || '';
      const className = classInfo?.className || '';

      return {
        ...s,
        submittedAt: s.submittedDate || s.createdAt,
        grade: s.marks,
        course: {
          _id: assignedClass?._id || null,
          code: program && section ? `${program} Sec ${section}` : 'N/A',
          name: subject || className || 'N/A',
          subject,
          section,
          classId: classInfo?._id || null,
        },
      };
    });

    return successResponse(enriched, 'Submissions retrieved successfully');
  } catch (error) {
    console.error('Submissions GET error:', error);
    return errorResponse('Failed to retrieve submissions', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { assignmentId, fileUrl, notes } = await req.json();

    if (!assignmentId || !fileUrl) {
      return errorResponse('Missing required fields', 'BAD_REQUEST', 400);
    }

    await dbConnect();

    // Verify assignment exists and get its course
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: authResult.user.id
    });

    if (existingSubmission) {
      return errorResponse('Assignment already submitted', 'ALREADY_SUBMITTED', 400);
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: authResult.user.id,
      course: assignment.course,
      file: fileUrl,
      fileUrl,
      feedback: notes || '',
      status: 'Submitted',
      submittedDate: new Date()
    });

    // Create real-time notification for the instructor
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.create({
        user: assignment.instructor,
        type: 'submission',
        title: 'New Assignment Submission',
        message: `${authResult.user.name || 'A student'} submitted assignment "${assignment.title}".`,
        timestamp: new Date(),
        read: false
      });
    } catch (notifErr) {
      console.error('Failed to create submission notification:', notifErr);
    }

    // Create StudentActivity log
    try {
      const StudentActivity = (await import('@/models/StudentActivity')).default;
      await StudentActivity.create({
        student: authResult.user.id,
        activityType: 'Assignment Submission',
        value: assignment.title,
        status: 'Completed',
        date: new Date(),
        remarks: `Submitted assignment "${assignment.title}"`
      });
    } catch (actErr) {
      console.error('Failed to create StudentActivity for submission:', actErr);
    }

    return successResponse(submission, 'Assignment submitted successfully');
  } catch (error) {
    console.error('Submissions POST error:', error);
    return errorResponse('Failed to submit assignment', 'SERVER_ERROR', 500);
  }
}
