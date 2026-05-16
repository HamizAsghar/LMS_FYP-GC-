import dbConnect from '@/dbConnect';
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
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const status = searchParams.get('status');
    if (status) filter.status = status;

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('instructor', 'name email department')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return successResponse(
      { courses, pagination: calculatePagination(total, page, limit) },
      'Courses retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve courses', 'SERVER_ERROR', 500);
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

    const validation = validateRequest(body, {
      name: { required: true, type: 'string', minLength: 3 },
      code: { required: true, type: 'string', minLength: 2 },
      instructor: { required: true, type: 'string' },
    });
    if (!validation.valid) {
      return errorResponse(validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    if (await Course.findOne({ code: body.code.toUpperCase() })) {
      return errorResponse('Course code already exists', 'DUPLICATE_ENTRY', 400);
    }

    const instructor = await User.findById(body.instructor);
    if (!instructor || instructor.role !== 'Instructor') {
      return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
    }

    const course = await Course.create({
      name: body.name,
      code: body.code.toUpperCase(),
      instructor: body.instructor,
      semester: body.semester || '',
      students: body.students || 0,
      category: body.category || '',
      status: body.status || 'Active',
    });

    await course.populate('instructor', 'name email');
    return successResponse(course, 'Course created successfully', 201);
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
