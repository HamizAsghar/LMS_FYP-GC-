// File: app/api/admin/courses/route.js

import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  validateRequest,
  parseQueryParams,
  calculatePagination,
  handleDbError
} from '@/middleware/admin';

// GET - Retrieve all courses with filtering and pagination
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Get total count
    const total = await Course.countDocuments(filter);

    // Get paginated results
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { courses, pagination },
      'Courses retrieved successfully'
    );
  } catch (error) {
    console.error('Get courses error:', error);
    return errorResponse('Failed to retrieve courses', 'SERVER_ERROR', 500);
  }
}

// POST - Create a new course
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
      name: { required: true, type: 'string', minLength: 3, maxLength: 200 },
      code: { required: true, type: 'string', minLength: 2, maxLength: 20 },
      instructor: { required: true, type: 'string' },
      semester: { type: 'string' },
      category: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Completed', 'Archived'] }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if code already exists
    const existingCourse = await Course.findOne({ code: body.code });
    if (existingCourse) {
      return errorResponse('Course code already exists', 'DUPLICATE_ENTRY', 400);
    }

    // Verify instructor exists
    const instructor = await User.findById(body.instructor);
    if (!instructor || instructor.role !== 'Instructor') {
      return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
    }

    // Create course
    const course = new Course({
      name: body.name,
      code: body.code,
      instructor: body.instructor,
      semester: body.semester || '',
      category: body.category || '',
      status: body.status || 'Active'
    });

    await course.save();
    await course.populate('instructor', 'name email');

    return successResponse(
      course,
      'Course created successfully',
      201
    );
  } catch (error) {
    console.error('Create course error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// GET - Retrieve course by ID (for [id]/route.js)
export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email department')
      .lean();

    if (!course) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    return successResponse(course, 'Course retrieved successfully');
  } catch (error) {
    console.error('Get course error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// PUT - Update course (for [id]/route.js)
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
      name: { type: 'string', minLength: 3, maxLength: 200 },
      code: { type: 'string', minLength: 2, maxLength: 20 },
      instructor: { type: 'string' },
      semester: { type: 'string' },
      category: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Completed', 'Archived'] }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // If updating instructor, verify it exists
    if (body.instructor) {
      const instructor = await User.findById(body.instructor);
      if (!instructor || instructor.role !== 'Instructor') {
        return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
      }
    }

    // Update course
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    if (!course) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    return successResponse(course, 'Course updated successfully');
  } catch (error) {
    console.error('Update course error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// DELETE - Delete course (for [id]/route.js)
export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    return successResponse(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Delete course error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
