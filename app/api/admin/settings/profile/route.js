import dbConnect from '@/dbConnect';
import User from '@/models/User';
import { adminAuthMiddleware, errorResponse, successResponse, handleDbError } from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const admin = await User.findById(authResult.user.id).select('-password').lean();
    if (!admin) return errorResponse('Admin not found', 'NOT_FOUND', 404);
    return successResponse(admin, 'Profile retrieved successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

export async function PUT(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const body = await req.json();
    const admin = await User.findByIdAndUpdate(
      authResult.user.id,
      {
        $set: {
          ...(body.name && { name: body.name }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.department !== undefined && { department: body.department }),
          ...(body.bio !== undefined && { bio: body.bio }),
          ...(body.avatar !== undefined && { avatar: body.avatar }),
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(admin, 'Profile updated successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
