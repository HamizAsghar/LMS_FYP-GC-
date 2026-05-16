import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function PUT(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { id } = await params;
    const instructorId = authResult.user.id;
    const body = await req.json();

    console.log(`API: Updating course ${id} for instructor ${instructorId}`);

    await dbConnect();

    const course = await Course.findById(id);
    if (!course) {
      console.log('API: Course not found');
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      console.log(`API: Unauthorized. Course instructor: ${course.instructor}, Requesting instructor: ${instructorId}`);
      return errorResponse('Unauthorized to update this course', 'FORBIDDEN', 403);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return successResponse(updatedCourse, 'Course updated successfully');
  } catch (error) {
    console.error('Course update error:', error);
    return errorResponse('Failed to update course', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { id } = await params;
    const instructorId = authResult.user.id;

    console.log(`API: Deleting course ${id} for instructor ${instructorId}`);

    await dbConnect();

    const course = await Course.findById(id);
    if (!course) {
      console.log('API: Course not found');
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      console.log(`API: Unauthorized. Course instructor: ${course.instructor}, Requesting instructor: ${instructorId}`);
      return errorResponse('Unauthorized to delete this course', 'FORBIDDEN', 403);
    }

    await Course.findByIdAndDelete(id);
    console.log('API: Course deleted successfully');

    return successResponse(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Course deletion error:', error);
    return errorResponse('Failed to delete course', 'SERVER_ERROR', 500);
  }
}
