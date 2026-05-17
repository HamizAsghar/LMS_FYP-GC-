import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import AssignedClass from '@/models/AssignedClass';
import Course from '@/models/Course';
import User from '@/models/User';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  validateRequest,
  parseQueryParams,
  calculatePagination,
  handleDbError,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    const status = searchParams.get('status');
    const course = searchParams.get('course');
    if (status) filter.status = status;
    if (course) filter.course = course;

    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
      .populate({
        path: 'course',
        select: 'subject section classId',
        populate: { path: 'classId', select: 'program className semester' }
      })
      .populate('instructor', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const now = new Date();
    const enriched = assignments.map((a) => {
      const assignedClass = a.course;
      const classInfo = assignedClass?.classId;
      return {
        ...a,
        course: {
          _id: assignedClass?._id || null,
          code: classInfo ? `${classInfo.program} Sec ${assignedClass.section}` : 'N/A',
          name: assignedClass?.subject || classInfo?.className || 'N/A',
          subject: assignedClass?.subject || '',
          section: assignedClass?.section || '',
        },
        deadlineStatus:
          new Date(a.deadline) < now
            ? 'Overdue'
            : new Date(a.deadline) - now < 86400000 * 3
            ? 'Due Soon'
            : 'On Track',
      };
    });

    return successResponse(
      { assignments: enriched, pagination: calculatePagination(total, page, limit) },
      'Assignments retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve assignments', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.deadline || body.totalMarks === undefined || !body.course || !body.instructor) {
      return errorResponse('Missing required assignment fields', 'VALIDATION_ERROR', 400);
    }

    if (!(await AssignedClass.findById(body.course))) {
      return errorResponse('Assigned class not found', 'NOT_FOUND', 404);
    }

    const instructor = await User.findById(body.instructor);
    if (!instructor || instructor.role !== 'Instructor') {
      return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
    }

    const assignment = await Assignment.create({
      title: body.title,
      subject: body.subject || '',
      description: body.description || '',
      deadline: new Date(body.deadline),
      totalMarks: body.totalMarks,
      course: body.course,
      instructor: body.instructor,
      status: body.status || 'Active',
    });

    await assignment.populate(['course', 'instructor']);
    return successResponse(assignment, 'Assignment created successfully', 201);
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
