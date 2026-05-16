import dbConnect from '@/dbConnect';
import InstructorActivity from '@/models/InstructorActivity';
import User from '@/models/User';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
} from '@/middleware/admin';

const TYPE_MAP = {
  'MDB Replies': 'mdbReplies',
  'GDB Marking': 'gdbMarking',
  'Assignment Upload': 'assignmentUploads',
  'Assignment Marking': 'assignmentMarking',
  'Ticket Handling': 'ticketHandling',
  'Email Responses': 'emailResponses',
};

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
    const status = searchParams.get('status');
    if (status) filter.status = status;

    if (search) {
      const instructors = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Instructor',
      }).select('_id');
      filter.instructor = { $in: instructors.map((i) => i._id) };
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await InstructorActivity.countDocuments(filter);
    const rows = await InstructorActivity.find(filter)
      .populate('instructor', 'name email department')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const activities = rows.map((activity) => {
      const base = {
        id: activity._id,
        instructorName: activity.instructor?.name || 'Unknown',
        instructorId: activity.instructor?._id,
        mdbReplies: 0,
        gdbMarking: 0,
        assignmentUploads: 0,
        assignmentMarking: 0,
        ticketHandling: 0,
        emailResponses: 0,
        activityType: activity.activityType,
        count: activity.count,
        status: activity.status,
        date: activity.date,
        remarks: activity.remarks,
      };
      const key = TYPE_MAP[activity.activityType];
      if (key) base[key] = activity.count;
      return base;
    });

    const stats = await InstructorActivity.aggregate([
      {
        $group: {
          _id: '$activityType',
          total: { $sum: '$count' },
        },
      },
    ]);

    return successResponse(
      {
        activities,
        statistics: stats,
        pagination: calculatePagination(total, page, limit),
      },
      'Instructor activities retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve instructor activities', 'SERVER_ERROR', 500);
  }
}
