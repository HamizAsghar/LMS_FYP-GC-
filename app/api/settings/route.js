import { authMiddleware, errorResponse, successResponse } from '@/middleware/auth';

const userPreferences = new Map();

export async function GET(req) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const prefs =
      userPreferences.get(authResult.user.id) || {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          assignments: true,
          deadlines: true,
          grades: true,
        },
        security: {
          twoFactor: false,
        },
        account: {
          language: 'en',
          timezone: 'PKT',
        },
      };

    return successResponse(prefs, 'Settings retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve settings', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const body = await req.json();
    const existing = userPreferences.get(authResult.user.id) || {};
    const updated = {
      ...existing,
      ...body,
      notifications: { ...existing.notifications, ...body.notifications },
      security: { ...existing.security, ...body.security },
      account: { ...existing.account, ...body.account },
    };

    userPreferences.set(authResult.user.id, updated);
    return successResponse(updated, 'Settings updated successfully');
  } catch (error) {
    return errorResponse('Failed to update settings', 'SERVER_ERROR', 500);
  }
}
