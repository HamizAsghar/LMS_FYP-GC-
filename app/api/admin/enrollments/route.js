import dbConnect from '@/dbConnect';
import Student from '@/models/Student';
import Course from '@/models/Course';
import { adminAuthMiddleware, errorResponse, successResponse } from '@/middleware/admin';

export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { studentId, courseId, action } = await req.json();
    if (!studentId || !courseId) {
      return errorResponse('Student ID and Course ID are required', 'VALIDATION_ERROR', 400);
    }

    await dbConnect();

    const student = await Student.findOne({ userId: studentId });
    if (!student) return errorResponse('Student record not found', 'NOT_FOUND', 404);

    const course = await Course.findById(courseId);
    if (!course) return errorResponse('Course not found', 'NOT_FOUND', 404);

    if (action === 'enroll') {
      if (student.courses.includes(courseId)) {
        return errorResponse('Student already enrolled in this course', 'DUPLICATE_ENTRY', 400);
      }
      student.courses.push(courseId);
      student.enrolledCourses = student.courses.length;
      course.students = (course.students || 0) + 1;
    } else if (action === 'unenroll') {
      student.courses = student.courses.filter(id => id.toString() !== courseId);
      student.enrolledCourses = student.courses.length;
      course.students = Math.max(0, (course.students || 0) - 1);
    } else {
      return errorResponse('Invalid action', 'VALIDATION_ERROR', 400);
    }

    await Promise.all([student.save(), course.save()]);

    return successResponse(null, `Student ${action === 'enroll' ? 'enrolled in' : 'unenrolled from'} course successfully`);
  } catch (error) {
    console.error('Enrollment error:', error);
    return errorResponse('Failed to process enrollment', 'SERVER_ERROR', 500);
  }
}

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    await dbConnect();

    if (studentId) {
      const student = await Student.findOne({ userId: studentId }).populate('courses');
      return successResponse(student ? student.courses : [], 'Enrolled courses retrieved');
    }

    return errorResponse('Student ID required', 'VALIDATION_ERROR', 400);
  } catch (error) {
    return errorResponse('Failed to retrieve enrollments', 'SERVER_ERROR', 500);
  }
}
