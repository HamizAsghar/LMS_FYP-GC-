import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Student from '@/models/Student';
import Instructor from '@/models/Instructor';
import { authMiddleware, errorResponse, successResponse } from '@/middleware/auth';

export async function GET(req) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const user = await User.findById(authResult.user.id).select('-password').lean();
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ userId: user._id }).lean();
    } else if (user.role === 'Instructor') {
      profile = await Instructor.findOne({ userId: user._id }).lean();
    }

    return successResponse({ user, profile }, 'Profile retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve profile', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const body = await req.json();

    const user = await User.findByIdAndUpdate(
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

    if (user.role === 'Student' && body.department) {
      await Student.updateOne({ userId: user._id }, { $set: { department: body.department } });
    }
    if (user.role === 'Instructor') {
      await Instructor.updateOne(
        { userId: user._id },
        { $set: { department: body.department, phone: body.phone } }
      );
    }

    return successResponse(user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse('Failed to update profile', 'SERVER_ERROR', 500);
  }
}
