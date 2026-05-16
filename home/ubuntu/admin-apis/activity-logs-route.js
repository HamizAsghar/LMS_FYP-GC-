// File: app/api/admin/activity-logs/route.js

import dbConnect from '@/dbConnect';
import ActivityLog from '@/models/ActivityLog';
import { NextResponse } from 'next/server';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
  handleDbError
} from '@/middleware/admin';

// GET - Retrieve activity logs with filtering and pagination
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const action = searchParams.get('action');
    const role = searchParams.get('role');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { user: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } }
      ];
    }

    if (action) {
      filter.action = { $regex: action, $options: 'i' };
    }

    if (role) {
      filter.role = role;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await ActivityLog.countDocuments(filter);

    // Get paginated results
    const logs = await ActivityLog.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { logs, pagination },
      'Activity logs retrieved successfully'
    );
  } catch (error) {
    console.error('Get activity logs error:', error);
    return errorResponse('Failed to retrieve activity logs', 'SERVER_ERROR', 500);
  }
}

// GET - Get activity log statistics
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    if (period === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get statistics
    const totalActivities = await ActivityLog.countDocuments({
      timestamp: { $gte: startDate }
    });

    const loginCount = await ActivityLog.countDocuments({
      action: 'Login',
      timestamp: { $gte: startDate }
    });

    const submissionCount = await ActivityLog.countDocuments({
      action: 'Submitted',
      timestamp: { $gte: startDate }
    });

    const createdCount = await ActivityLog.countDocuments({
      action: 'Created',
      timestamp: { $gte: startDate }
    });

    const updatedCount = await ActivityLog.countDocuments({
      action: 'Updated',
      timestamp: { $gte: startDate }
    });

    // Activity by role
    const activityByRole = await ActivityLog.aggregate([
      {
        $match: { timestamp: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top actions
    const topActions = await ActivityLog.aggregate([
      {
        $match: { timestamp: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      totalActivities,
      loginCount,
      submissionCount,
      createdCount,
      updatedCount,
      activityByRole: activityByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topActions: topActions.map(item => ({
        action: item._id,
        count: item.count
      }))
    };

    return successResponse(stats, 'Activity log statistics retrieved successfully');
  } catch (error) {
    console.error('Get activity log stats error:', error);
    return errorResponse('Failed to retrieve activity log statistics', 'SERVER_ERROR', 500);
  }
}

// POST - Create activity log (internal use)
export async function POST(req) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.user || !body.action) {
      return errorResponse('User and action are required', 'VALIDATION_ERROR', 400);
    }

    await dbConnect();

    const log = new ActivityLog({
      user: body.user,
      role: body.role || 'System',
      action: body.action,
      target: body.target || '',
      ipAddress: body.ipAddress || ''
    });

    await log.save();

    return successResponse(log, 'Activity log created successfully', 201);
  } catch (error) {
    console.error('Create activity log error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// GET - Export activity logs
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get all logs
    const logs = await ActivityLog.find(filter).lean();

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(logs);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="activity-logs.csv"'
        }
      });
    } else {
      // Return as JSON
      return successResponse(logs, 'Activity logs exported successfully');
    }
  } catch (error) {
    console.error('Export activity logs error:', error);
    return errorResponse('Failed to export activity logs', 'SERVER_ERROR', 500);
  }
}

// Helper function to convert logs to CSV
function convertToCSV(logs) {
  const headers = ['User', 'Role', 'Action', 'Target', 'Timestamp', 'IP Address'];
  const rows = logs.map(log => [
    log.user,
    log.role,
    log.action,
    log.target,
    new Date(log.timestamp).toISOString(),
    log.ipAddress
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\\n');

  return csv;
}
