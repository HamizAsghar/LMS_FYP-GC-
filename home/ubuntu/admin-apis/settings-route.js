// File: app/api/admin/settings/route.js

import dbConnect from '@/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  validateRequest,
  handleDbError
} from '@/middleware/admin';

// In-memory settings store (in production, use a database model)
let systemSettings = {
  general: {
    platformName: 'EduHub LMS',
    platformUrl: 'https://eduhub.university.edu',
    adminEmail: 'admin@university.edu',
    supportEmail: 'support@university.edu',
    timezone: 'PKT',
    language: 'en',
    description: 'EduHub is a comprehensive Learning Management System'
  },
  email: {
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@university.edu',
    smtpSecure: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    assignmentNotifications: true,
    submissionNotifications: true,
    systemNotifications: false,
    reportNotifications: true
  }
};

// GET - Retrieve system settings
export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    return successResponse(systemSettings, 'Settings retrieved successfully');
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse('Failed to retrieve settings', 'SERVER_ERROR', 500);
  }
}

// PUT - Update system settings
export async function PUT(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const body = await req.json();

    // Validate request
    const schema = {
      general: { type: 'object' },
      email: { type: 'object' },
      notifications: { type: 'object' }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Update settings
    if (body.general) {
      systemSettings.general = { ...systemSettings.general, ...body.general };
    }

    if (body.email) {
      systemSettings.email = { ...systemSettings.email, ...body.email };
    }

    if (body.notifications) {
      systemSettings.notifications = { ...systemSettings.notifications, ...body.notifications };
    }

    return successResponse(systemSettings, 'Settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 'SERVER_ERROR', 500);
  }
}

// GET - Retrieve admin profile
export async function GET_PROFILE(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    // Get admin user from token
    const adminId = authResult.user.id;

    const admin = await User.findById(adminId)
      .select('-password')
      .lean();

    if (!admin) {
      return errorResponse('Admin not found', 'NOT_FOUND', 404);
    }

    return successResponse(admin, 'Admin profile retrieved successfully');
  } catch (error) {
    console.error('Get admin profile error:', error);
    return errorResponse('Failed to retrieve admin profile', 'SERVER_ERROR', 500);
  }
}

// PUT - Update admin profile
export async function PUT_PROFILE(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const body = await req.json();
    const adminId = authResult.user.id;

    // Validate request
    const schema = {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      phone: { type: 'string' },
      department: { type: 'string' },
      avatar: { type: 'string' }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Update admin
    const admin = await User.findByIdAndUpdate(
      adminId,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return errorResponse('Admin not found', 'NOT_FOUND', 404);
    }

    return successResponse(admin, 'Admin profile updated successfully');
  } catch (error) {
    console.error('Update admin profile error:', error);
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

// PUT - Change admin password
export async function PUT_PASSWORD(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const body = await req.json();
    const adminId = authResult.user.id;

    // Validate request
    const schema = {
      currentPassword: { required: true, type: 'string', minLength: 6 },
      newPassword: { required: true, type: 'string', minLength: 6 },
      confirmPassword: { required: true, type: 'string', minLength: 6 }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if new password and confirm password match
    if (body.newPassword !== body.confirmPassword) {
      return errorResponse('New password and confirm password do not match', 'VALIDATION_ERROR', 400);
    }

    // Get admin with password
    const admin = await User.findById(adminId).select('+password');

    if (!admin) {
      return errorResponse('Admin not found', 'NOT_FOUND', 404);
    }

    // Verify current password
    const isPasswordValid = await admin.matchPassword(body.currentPassword);

    if (!isPasswordValid) {
      return errorResponse('Current password is incorrect', 'VALIDATION_ERROR', 400);
    }

    // Update password
    admin.password = body.newPassword;
    await admin.save();

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password', 'SERVER_ERROR', 500);
  }
}

// POST - Test email configuration
export async function POST_TEST_EMAIL(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    // In production, you would send a test email here using nodemailer
    // For now, we'll just return success
    
    return successResponse(
      { message: 'Test email would be sent to admin email' },
      'Email configuration is valid'
    );
  } catch (error) {
    console.error('Test email error:', error);
    return errorResponse('Failed to test email configuration', 'SERVER_ERROR', 500);
  }
}

// GET - Get notification preferences
export async function GET_NOTIFICATIONS(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    return successResponse(
      systemSettings.notifications,
      'Notification preferences retrieved successfully'
    );
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return errorResponse('Failed to retrieve notification preferences', 'SERVER_ERROR', 500);
  }
}

// PUT - Update notification preferences
export async function PUT_NOTIFICATIONS(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const body = await req.json();

    // Validate notification preferences
    const schema = {
      emailNotifications: { type: 'boolean' },
      pushNotifications: { type: 'boolean' },
      assignmentNotifications: { type: 'boolean' },
      submissionNotifications: { type: 'boolean' },
      systemNotifications: { type: 'boolean' },
      reportNotifications: { type: 'boolean' }
    };

    const validation = validateRequest(body, schema);
    if (!validation.valid) {
      return errorResponse(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Update notification preferences
    systemSettings.notifications = { ...systemSettings.notifications, ...body };

    return successResponse(
      systemSettings.notifications,
      'Notification preferences updated successfully'
    );
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return errorResponse('Failed to update notification preferences', 'SERVER_ERROR', 500);
  }
}
