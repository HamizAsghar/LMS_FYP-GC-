import dbConnect from '@/dbConnect';
import ActivityLog from '@/models/ActivityLog';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
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
        { action: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } },
      ];
    }
    const role = searchParams.get('role');
    const action = searchParams.get('action');
    if (role) filter.role = role;
    if (action) filter.action = { $regex: action, $options: 'i' };

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return successResponse(
      { logs, pagination: calculatePagination(total, page, limit) },
      'Activity logs retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve activity logs', 'SERVER_ERROR', 500);
  }
}
