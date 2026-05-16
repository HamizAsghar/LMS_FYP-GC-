// File: app/api/admin/notifications/route.js

import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
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

// GET - Retrieve all notifications with filtering and pagination
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const type = searchParams.get('type');
    const read = searchParams.get('read');

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (read !== null) {
      filter.read = read === 'true';
    }

    // Get total count
    const total = await Notification.countDocuments(filter);

    // Get paginated results
    const notifications = await Notification.find(filter)
      .populate('user', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { notifications, pagination },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to retrieve notifications', 'SERVER_ERROR', 500);
  }
}

// POST - Create a new notification
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
      type: { required: true, type: 'string', enum: ['assignment', 'submission', 'deadline', 'grade', 'system'] },
      title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
      message: { required: true, type: 'string', minLength: 3 },
      recipients: { required: true, type: 'object' }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Get recipients
    let recipients = [];
    if (body.recipients === 'all' || (Array.isArray(body.recipients) && body.recipients[0] === 'all')) {
      // Send to all users
      recipients = await User.find().select('_id').lean();
    } else if (Array.isArray(body.recipients)) {
      // Send to specific users
      recipients = body.recipients;
    } else {
      return errorResponse('Invalid recipients format', 'VALIDATION_ERROR', 400);
    }

    // Create notifications for each recipient
    const notifications = [];
    for (const recipient of recipients) {
      const userId = typeof recipient === 'string' ? recipient : recipient._id;
      
      const notification = new Notification({
        user: userId,
        type: body.type,
        title: body.title,
        message: body.message
      });

      await notification.save();
      notifications.push(notification);
    }

    return successResponse(
      { count: notifications.length, notifications: notifications.slice(0, 5) },
      `Notification sent to ${notifications.length} recipient(s)`,
      201
    );
  } catch (error) {
    console.error('Create notification error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// GET - Retrieve notification by ID (for [id]/route.js)
export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const notification = await Notification.findById(id)
      .populate('user', 'name email')
      .lean();

    if (!notification) {
      return errorResponse('Notification not found', 'NOT_FOUND', 404);
    }

    return successResponse(notification, 'Notification retrieved successfully');
  } catch (error) {
    console.error('Get notification error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// PUT - Mark notification as read (for [id]/read/route.js)
export async function PUT(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    ).populate('user', 'name email');

    if (!notification) {
      return errorResponse('Notification not found', 'NOT_FOUND', 404);
    }

    return successResponse(notification, 'Notification marked as read');
  } catch (error) {
    console.error('Update notification error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// DELETE - Delete notification (for [id]/route.js)
export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { id } = params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return errorResponse('Notification not found', 'NOT_FOUND', 404);
    }

    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// POST - Mark all notifications as read
export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const result = await Notification.updateMany(
      { read: false },
      { $set: { read: true } }
    );

    return successResponse(
      { modifiedCount: result.modifiedCount },
      `${result.modifiedCount} notification(s) marked as read`
    );
  } catch (error) {
    console.error('Mark all as read error:', error);
    return errorResponse('Failed to mark notifications as read', 'SERVER_ERROR', 500);
  }
}

// DELETE - Clear all notifications
export async function DELETE(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const result = await Notification.deleteMany({});

    return successResponse(
      { deletedCount: result.deletedCount },
      `${result.deletedCount} notification(s) deleted`
    );
  } catch (error) {
    console.error('Clear all notifications error:', error);
    return errorResponse('Failed to clear notifications', 'SERVER_ERROR', 500);
  }
}
