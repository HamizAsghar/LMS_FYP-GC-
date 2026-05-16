import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  validateRequest,
} from '@/middleware/admin';
import dbConnect from '@/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

let systemSettings = {
  general: {
    platformName: 'EduHub LMS',
    platformUrl: 'http://localhost:3000',
    adminEmail: 'admin@eduhub.edu',
    supportEmail: 'support@eduhub.edu',
    timezone: 'PKT',
    language: 'en',
    description: 'Academic Learning Management System',
  },
  email: {
    smtpServer: process.env.EMAIL_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.EMAIL_PORT) || 587,
    smtpUsername: process.env.EMAIL_USERNAME || '',
    smtpSecure: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    assignmentNotifications: true,
    submissionNotifications: true,
    systemNotifications: true,
    reportNotifications: true,
  },
  security: {
    sessionTimeout: 30,
    twoFactorEnabled: false,
  },
};

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }
    return successResponse(systemSettings, 'Settings retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve settings', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const body = await req.json();
    if (body.general) systemSettings.general = { ...systemSettings.general, ...body.general };
    if (body.email) systemSettings.email = { ...systemSettings.email, ...body.email };
    if (body.notifications) {
      systemSettings.notifications = { ...systemSettings.notifications, ...body.notifications };
    }
    if (body.security) systemSettings.security = { ...systemSettings.security, ...body.security };

    return successResponse(systemSettings, 'Settings updated successfully');
  } catch (error) {
    return errorResponse('Failed to update settings', 'SERVER_ERROR', 500);
  }
}
