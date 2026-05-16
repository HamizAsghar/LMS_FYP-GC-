import dbConnect from '@/dbConnect';
import InstructorActivity from '@/models/InstructorActivity';
import User from '@/models/User';
import {
  instructorAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const instructorId = authResult.user.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const activityType = searchParams.get('activityType');

    const filter = { instructor: instructorId };
    if (status) filter.status = status;
    if (activityType) filter.activityType = activityType;

    const [user, activities] = await Promise.all([
      User.findById(instructorId).select('name email').lean(),
      InstructorActivity.find(filter).sort({ date: -1 }).lean()
    ]);

    return successResponse({
      user,
      activities
    }, 'Activities retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve activities', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const instructorId = authResult.user.id;
    const body = await req.json();

    const validTypes = [
      'MDB Replies',
      'GDB Marking',
      'Assignment Upload',
      'Assignment Marking',
      'Ticket Handling',
      'Email Responses',
    ];

    if (!body.activityType || !validTypes.includes(body.activityType)) {
      return errorResponse('Valid activityType is required', 'VALIDATION_ERROR', 400);
    }

    const activity = await InstructorActivity.create({
      instructor: instructorId,
      activityType: body.activityType,
      count: body.count ?? 1,
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || 'Completed',
      remarks: body.remarks || '',
    });

    return successResponse(activity, 'Activity logged successfully', 201);
  } catch (error) {
    console.error('Activity creation error:', error);
    return errorResponse(error.message || 'Failed to create activity', 'SERVER_ERROR', 500);
  }
}
