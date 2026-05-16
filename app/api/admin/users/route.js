import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Student from '@/models/Student';
import Instructor from '@/models/Instructor';
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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    const approvalStatus = searchParams.get('approvalStatus');
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (department) filter.department = { $regex: department, $options: 'i' };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return successResponse(
      { users, pagination: calculatePagination(total, page, limit) },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('Failed to retrieve users', 'SERVER_ERROR', 500);
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
      name: { required: true, type: 'string', minLength: 2 },
      email: { required: true, type: 'string', email: true },
      password: { required: true, type: 'string', minLength: 6 },
      role: { required: true, type: 'string', enum: ['Student', 'Instructor', 'Admin'] },
    });

    if (!validation.valid) {
      return errorResponse(validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    if (await User.findOne({ email: body.email.toLowerCase() })) {
      return errorResponse('Email already exists', 'DUPLICATE_ENTRY', 400);
    }

    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      password: body.password,
      role: body.role,
      department: body.department || '',
      status: body.status || 'Active',
      isVerified: true,
    });

    if (body.role === 'Student') {
      await Student.create({ userId: user._id, department: body.department || '' });
    } else if (body.role === 'Instructor') {
      await Instructor.create({
        userId: user._id,
        department: body.department || '',
        phone: body.phone || '',
      });
    }

    const safe = await User.findById(user._id).select('-password').lean();
    return successResponse(safe, 'User created successfully', 201);
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
