import dbConnect from '@/dbConnect';
import LearningMaterial from '@/models/LearningMaterial';
import Student from '@/models/Student';
import StudentActivity from '@/models/StudentActivity';
import {
  studentAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const studentId = authResult.user.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const profile = await Student.findOne({ userId: studentId });
    const courseIds = profile?.courses?.length ? profile.courses : [];

    const filter = courseIds.length ? { course: { $in: courseIds } } : {};
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const materials = await LearningMaterial.find(filter)
      .populate('course', 'name code')
      .sort({ uploadedDate: -1 })
      .lean();

    return successResponse(materials, 'Materials retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve materials', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { materialId } = await req.json();
    if (!materialId) {
      return errorResponse('materialId is required', 'VALIDATION_ERROR', 400);
    }

    const material = await LearningMaterial.findByIdAndUpdate(
      materialId,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);

    await StudentActivity.create({
      student: authResult.user.id,
      activityType: 'Material Download',
      value: 1,
      status: 'Completed',
      remarks: material.title,
    });

    return successResponse(material, 'Download recorded successfully');
  } catch (error) {
    return errorResponse('Failed to record download', 'SERVER_ERROR', 500);
  }
}
