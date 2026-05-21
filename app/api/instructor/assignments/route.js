import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import Submission from '@/models/Submission';
import Course from '@/models/Course';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const query = { instructor: instructorId };
    if (courseId) query.course = courseId;

    const [user, assignments] = await Promise.all([
      User.findById(instructorId).select('name email').lean(),
      Assignment.find(query)
        .populate({
          path: 'course',
          select: 'name code subject section classId',
          populate: { path: 'classId', select: 'program className' }
        })
        .sort({ createdAt: -1 })
    ]);

    const mappedAssignments = await Promise.all(assignments.map(async (a) => {
      const assignmentObj = typeof a.toObject === 'function' ? a.toObject() : a;
      
      // If Mongoose populate returned null, it might be a standard Course
      if (!assignmentObj.course && a.course) {
        const stdCourse = await Course.findById(a.course).select('name code').lean();
        if (stdCourse) {
          assignmentObj.course = {
            _id: stdCourse._id,
            code: stdCourse.code,
            name: stdCourse.name
          };
        }
      }

      if (assignmentObj.course && assignmentObj.course.subject && !assignmentObj.course.code) {
        // It's an AssignedClass
        assignmentObj.course.code = `${assignmentObj.course.classId?.program || ''} Sec ${assignmentObj.course.section || ''}`;
        assignmentObj.course.name = assignmentObj.course.subject;
      }

      // Calculate real submissions count dynamically
      const submissionCount = await Submission.countDocuments({ assignment: assignmentObj._id });
      assignmentObj.submissions = Array(submissionCount).fill(1);

      return assignmentObj;
    }));

    return successResponse({
      user,
      assignments: mappedAssignments
    }, 'Instructor assignments retrieved successfully');
  } catch (error) {
    console.error('Instructor assignments error:', error);
    return errorResponse('Failed to retrieve instructor assignments', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    const body = await req.json();

    await dbConnect();

    const newAssignment = await Assignment.create({
      ...body,
      instructor: instructorId,
      uploadedDate: new Date()
    });

    // Create instructor activity log
    try {
      const InstructorActivity = (await import('@/models/InstructorActivity')).default;
      await InstructorActivity.create({
        instructor: instructorId,
        activityType: 'Assignment Upload',
        count: 1,
        status: 'Completed',
        remarks: `Uploaded assignment "${body.title}"`,
        date: new Date()
      });
    } catch (actErr) {
      console.error('Failed to log instructor upload activity:', actErr);
    }

    // Notify all enrolled students
    try {
      const Student = (await import('@/models/Student')).default;
      const Notification = (await import('@/models/Notification')).default;
      
      const enrolledStudents = await Student.find({ courses: body.course });
      if (enrolledStudents.length > 0) {
        const notifications = enrolledStudents.map(student => ({
          user: student.userId,
          title: 'New Assignment',
          message: `A new assignment "${body.title}" has been uploaded for ${body.subject || 'your course'}.`,
          type: 'assignment',
          assignmentId: newAssignment._id
        }));
        await Notification.insertMany(notifications);
      }
    } catch (notifyError) {
      console.error('Failed to create notifications:', notifyError);
      // Don't fail the whole request if notifications fail
    }

    return successResponse(newAssignment, 'Assignment created successfully', 201);
  } catch (error) {
    console.error('Create assignment error:', error);
    return errorResponse('Failed to create assignment', 'SERVER_ERROR', 500);
  }
}
