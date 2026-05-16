// File: app/api/admin/users/route.js

import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Student from '@/models/Student';
import Instructor from '@/models/Instructor';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  validateRequest,
  parseQueryParams,
  calculatePagination,
  handleDbError
} from '@/middleware/admin';

// GET - Retrieve all users with filtering and pagination
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

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get paginated results
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { users, pagination },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('Failed to retrieve users', 'SERVER_ERROR', 500);
  }
}

// POST - Create a new user
export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const body = await req.json();

    // Validate request
    const schema = {
      name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
      email: { required: true, type: 'string', email: true },
      password: { required: true, type: 'string', minLength: 6 },
      role: { required: true, type: 'string', enum: ['Student', 'Instructor', 'Admin'] },
      department: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Inactive'] }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return errorResponse('Email already exists', 'DUPLICATE_ENTRY', 400);
    }

    // Create user
    const user = new User({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      department: body.department || '',
      status: body.status || 'Active',
      isVerified: true // Admin-created users are verified by default
    });

    await user.save();

    // Create related profile if needed
    if (body.role === 'Student') {
      const student = new Student({
        userId: user._id,
        department: body.department || ''
      });
      await student.save();
    } else if (body.role === 'Instructor') {
      const instructor = new Instructor({
        userId: user._id,
        department: body.department || '',
        phone: body.phone || ''
      });
      await instructor.save();
    }

    // Remove password from response
    user.password = undefined;

    return successResponse(
      user,
      'User created successfully',
      201
    );
  } catch (error) {
    console.error('Create user error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// GET - Retrieve user by ID
export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }

    return successResponse(user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// PUT - Update user
export async function PUT(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;
    const body = await req.json();

    // Validate request
    const schema = {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      department: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      phone: { type: 'string' }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }

    // Update related profile if needed
    const userRole = user.role;
    if (userRole === 'Student' && body.department) {
      await Student.updateOne(
        { userId: id },
        { $set: { department: body.department } }
      );
    } else if (userRole === 'Instructor' && (body.department || body.phone)) {
      await Instructor.updateOne(
        { userId: id },
        { $set: { department: body.department, phone: body.phone } }
      );
    }

    return successResponse(user, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// DELETE - Delete user
export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const user = await User.findById(id);

    if (!user) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }

    // Delete related profiles
    if (user.role === 'Student') {
      await Student.deleteOne({ userId: id });
    } else if (user.role === 'Instructor') {
      await Instructor.deleteOne({ userId: id });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
