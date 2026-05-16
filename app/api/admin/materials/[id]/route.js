import dbConnect from '@/dbConnect';
import LearningMaterial from '@/models/LearningMaterial';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  handleDbError,
} from '@/middleware/admin';

export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const material = await LearningMaterial.findById(id)
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email')
      .lean();
    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);
    return successResponse(material, 'Material retrieved successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const material = await LearningMaterial.findByIdAndDelete(id);
    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);
    return successResponse(null, 'Material deleted successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
