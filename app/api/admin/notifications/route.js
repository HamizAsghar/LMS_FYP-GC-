import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
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

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }
    const type = searchParams.get('type');
    const read = searchParams.get('read');
    if (type) filter.type = type;
    if (read !== null && read !== '') filter.read = read === 'true';

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate('user', 'name email role')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ read: false });

    return successResponse(
      { notifications, unreadCount, pagination: calculatePagination(total, page, limit) },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve notifications', 'SERVER_ERROR', 500);
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

    if (!body.type || !body.title || !body.message) {
      return errorResponse('type, title, and message are required', 'VALIDATION_ERROR', 400);
    }

    let recipientIds = [];
    if (body.recipients === 'all') {
      const users = await User.find({ status: 'Active' }).select('_id');
      recipientIds = users.map((u) => u._id);
    } else if (Array.isArray(body.recipients)) {
      recipientIds = body.recipients;
    } else if (body.role) {
      const users = await User.find({ role: body.role, status: 'Active' }).select('_id');
      recipientIds = users.map((u) => u._id);
    } else {
      return errorResponse('recipients, role, or "all" required', 'VALIDATION_ERROR', 400);
    }

    const docs = recipientIds.map((userId) => ({
      user: userId,
      type: body.type,
      title: body.title,
      message: body.message,
    }));

    await Notification.insertMany(docs);
    return successResponse(
      { count: docs.length },
      `Notification sent to ${docs.length} recipient(s)`,
      201
    );
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
