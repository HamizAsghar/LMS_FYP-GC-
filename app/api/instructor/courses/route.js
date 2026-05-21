import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    const [user, courses, assignedClasses] = await Promise.all([
      User.findById(instructorId).select('name email').lean(),
      Course.find({ instructor: instructorId }).sort({ createdAt: -1 }),
      AssignedClass.find({ teacherId: instructorId })
        .populate('classId', 'program className semester')
        .lean()
    ]);
    
    const coursesWithDetails = await Promise.all(courses.map(async (course) => {
      const assignmentCount = await Assignment.countDocuments({ course: course._id });
      const enrolledCount = await Student.countDocuments({ courses: course._id });
      return {
        ...course.toObject(),
        students: enrolledCount,
        assignmentCount
      };
    }));

    const mappedAssignedClasses = await Promise.all(assignedClasses.map(async (ac) => {
      const assignmentCount = await Assignment.countDocuments({ course: ac._id });
      return {
        _id: ac._id,
        name: ac.subject,
        code: ac.classId ? `${ac.classId.program} Sec ${ac.section}` : `Sec ${ac.section}`,
        semester: ac.classId ? ac.classId.semester : '',
        description: `Assigned Class: ${ac.classId?.className || ''}`,
        progress: 0,
        students: ac.enrolledStudents?.length || 0,
        assignmentCount,
        status: 'Active',
        isAssignedClass: true
      };
    }));

    return successResponse({
      user,
      courses: [...mappedAssignedClasses, ...coursesWithDetails]
    }, 'Instructor courses retrieved successfully');
  } catch (error) {
    console.error('Instructor courses error:', error);
    return errorResponse('Failed to retrieve instructor courses', 'SERVER_ERROR', 500);
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
    const { name, code, description, semester } = body;

    if (!name || !code) {
      return errorResponse('Course name and code are required', 'BAD_REQUEST', 400);
    }

    await dbConnect();

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return errorResponse('Course with this code already exists', 'BAD_REQUEST', 400);
    }

    const newCourse = await Course.create({
      name,
      code,
      description,
      semester,
      instructor: instructorId,
      status: 'Active',
      students: 0
    });

    return successResponse(newCourse, 'Course created successfully', 201);
  } catch (error) {
    console.error('Course creation error:', error);
    return errorResponse('Failed to create course', 'SERVER_ERROR', 500);
  }
}
