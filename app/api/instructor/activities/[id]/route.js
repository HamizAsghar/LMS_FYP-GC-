import dbConnect from '@/dbConnect';
import InstructorActivity from '@/models/InstructorActivity';
import {
  instructorAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/instructor';

export async function PUT(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const activity = await InstructorActivity.findOneAndUpdate(
      { _id: id, instructor: authResult.user.id },
      {
        $set: {
          ...(body.activityType && { activityType: body.activityType }),
          ...(body.count !== undefined && { count: body.count }),
          ...(body.status && { status: body.status }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.remarks !== undefined && { remarks: body.remarks }),
        },
      },
      { new: true }
    );

    if (!activity) return errorResponse('Activity not found', 'NOT_FOUND', 404);
    return successResponse(activity, 'Activity updated successfully');
  } catch (error) {
    return errorResponse('Failed to update activity', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const instructorId = authResult.user.id;
    console.log(`API: Attempting to delete activity ${id} for instructor ${instructorId}`);

    const activity = await InstructorActivity.findOneAndDelete({
      _id: id,
      instructor: instructorId,
    });

    if (!activity) {
      console.log('API: Activity not found or unauthorized');
      return errorResponse('Activity not found', 'NOT_FOUND', 404);
    }
    
    console.log('API: Activity deleted successfully');
    return successResponse(null, 'Activity deleted successfully');
  } catch (error) {
    return errorResponse('Failed to delete activity', 'SERVER_ERROR', 500);
  }
}
