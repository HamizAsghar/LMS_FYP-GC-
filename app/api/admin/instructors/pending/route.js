import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const pendingUsers = await User.find({
      role: 'Instructor',
      approvalStatus: 'Pending',
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      pendingUsers.map(async (u) => {
        const profile = await Instructor.findOne({ userId: u._id }).lean();
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          department: u.department,
          phone: profile?.phone || '',
          joinedDate: u.joinedDate,
          approvalStatus: u.approvalStatus,
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
        };
      })
    );

    return successResponse(enriched, 'Pending instructors retrieved');
  } catch (error) {
    return errorResponse('Failed to retrieve pending instructors', 'SERVER_ERROR', 500);
  }
}
