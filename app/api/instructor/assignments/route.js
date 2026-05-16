import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import Submission from '@/models/Submission';
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
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
    ]);

    return successResponse({
      user,
      assignments
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

    // Notify all enrolled students
    try {
      const Student = (await import('@/models/Student')).default;
      const Notification = (await import('@/models/Notification')).default;
      
      const enrolledStudents = await Student.find({ courses: body.course });
      
      if (enrolledStudents.length > 0) {
        const notifications = enrolledStudents.map(student => ({
          student: student.userId,
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
