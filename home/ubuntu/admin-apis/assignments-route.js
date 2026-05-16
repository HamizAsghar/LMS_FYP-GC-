// File: app/api/admin/assignments/route.js

import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import Submission from '@/models/Submission';
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

// GET - Retrieve all assignments with filtering and pagination
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
    const course = searchParams.get('course');

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (course) {
      filter.course = course;
    }

    // Get total count
    const total = await Assignment.countDocuments(filter);

    // Get paginated results
    const assignments = await Assignment.find(filter)
      .populate('course', 'name code')
      .populate('instructor', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { assignments, pagination },
      'Assignments retrieved successfully'
    );
  } catch (error) {
    console.error('Get assignments error:', error);
    return errorResponse('Failed to retrieve assignments', 'SERVER_ERROR', 500);
  }
}

// POST - Create a new assignment
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
      title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
      subject: { type: 'string' },
      description: { type: 'string' },
      deadline: { required: true, type: 'string' },
      totalMarks: { required: true, type: 'number', min: 0 },
      course: { required: true, type: 'string' },
      instructor: { required: true, type: 'string' },
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

    // Verify course exists
    const courseExists = await Course.findById(body.course);
    if (!courseExists) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    // Verify instructor exists
    const instructor = await User.findById(body.instructor);
    if (!instructor || instructor.role !== 'Instructor') {
      return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
    }

    // Create assignment
    const assignment = new Assignment({
      title: body.title,
      subject: body.subject || '',
      description: body.description || '',
      deadline: new Date(body.deadline),
      totalMarks: body.totalMarks,
      course: body.course,
      instructor: body.instructor,
      status: body.status || 'Active'
    });

    await assignment.save();
    await assignment.populate('course', 'name code');
    await assignment.populate('instructor', 'name email');

    return successResponse(
      assignment,
      'Assignment created successfully',
      201
    );
  } catch (error) {
    console.error('Create assignment error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// GET - Retrieve assignment by ID (for [id]/route.js)
export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const assignment = await Assignment.findById(id)
      .populate('course', 'name code')
      .populate('instructor', 'name email')
      .lean();

    if (!assignment) {
      return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    }

    // Get submission statistics
    const submissions = await Submission.countDocuments({ assignment: id });
    assignment.submissionsCount = submissions;

    return successResponse(assignment, 'Assignment retrieved successfully');
  } catch (error) {
    console.error('Get assignment error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// PUT - Update assignment (for [id]/route.js)
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
      title: { type: 'string', minLength: 3, maxLength: 200 },
      subject: { type: 'string' },
      description: { type: 'string' },
      deadline: { type: 'string' },
      totalMarks: { type: 'number', min: 0 },
      course: { type: 'string' },
      instructor: { type: 'string' },
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

    // If updating course, verify it exists
    if (body.course) {
      const courseExists = await Course.findById(body.course);
      if (!courseExists) {
        return errorResponse('Course not found', 'NOT_FOUND', 404);
      }
    }

    // If updating instructor, verify it exists
    if (body.instructor) {
      const instructor = await User.findById(body.instructor);
      if (!instructor || instructor.role !== 'Instructor') {
        return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
      }
    }

    // Convert deadline to Date if provided
    if (body.deadline) {
      body.deadline = new Date(body.deadline);
    }

    // Update assignment
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('course', 'name code').populate('instructor', 'name email');

    if (!assignment) {
      return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    }

    return successResponse(assignment, 'Assignment updated successfully');
  } catch (error) {
    console.error('Update assignment error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// DELETE - Delete assignment (for [id]/route.js)
export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: id });

    // Delete assignment
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    }

    return successResponse(null, 'Assignment deleted successfully');
  } catch (error) {
    console.error('Delete assignment error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
