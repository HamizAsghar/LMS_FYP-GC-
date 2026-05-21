import dbConnect from '@/dbConnect';
import Material from '@/models/Material';
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
    const material = await Material.findById(id)
      .populate('course')
      .populate('instructor', 'name email')
      .lean();
    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);

    const AssignedClass = (await import('@/models/AssignedClass')).default;
    const classInfo = material.course?.classId 
      ? await AssignedClass.findById(material.course).populate('classId').lean() 
      : null;

    const formatted = {
      ...material,
      uploadedBy: material.instructor,
      downloads: material.stats || 0,
      course: material.course ? {
        _id: material.course._id,
        code: classInfo ? `${classInfo.classId.program} Sec ${classInfo.section}` : material.course.code || 'N/A',
        name: material.course.name || material.course.subject || 'N/A',
      } : null
    };

    return successResponse(formatted, 'Material retrieved successfully');
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
    const material = await Material.findByIdAndDelete(id);
    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);
    return successResponse(null, 'Material deleted successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
