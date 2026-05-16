import dbConnect from '@/dbConnect';
import Material from '@/models/Material';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';
import { uploadToCloudinary } from '@/utils/cloudinary';

export async function PUT(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) return errorResponse(authResult.message, authResult.error, authResult.status);
    
    const instructorId = authResult.user.id;
    const { id } = await params;
    
    await dbConnect();
    
    const material = await Material.findOne({ _id: id, instructor: instructorId });
    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);

    const formData = await req.formData();
    const title = formData.get('title');
    const courseId = formData.get('course');
    const description = formData.get('description');
    const file = formData.get('file');

    if (title) material.title = title;
    if (courseId) material.course = courseId;
    if (description !== null) material.description = description;

    if (file && typeof file !== 'string') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: 'eduhub/materials' });
      material.fileUrl = result.secure_url;
      material.size = `${(result.bytes / 1024 / 1024).toFixed(2)} MB`;
      const ext = result.format?.toLowerCase();
      if (['pdf'].includes(ext)) material.type = 'PDF';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) material.type = 'Video';
      else if (['ppt', 'pptx', 'key'].includes(ext)) material.type = 'Presentation';
    }

    await material.save();

    return successResponse({ materialId: material._id }, 'Material updated');
  } catch (error) {
    console.error('Material PUT error:', error);
    return errorResponse('Failed to update material', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) return errorResponse(authResult.message, authResult.error, authResult.status);
    
    const instructorId = authResult.user.id;
    const { id } = await params;

    await dbConnect();

    const result = await Material.deleteOne({ _id: id, instructor: instructorId });
    if (result.deletedCount === 0) {
      return errorResponse('Material not found', 'NOT_FOUND', 404);
    }

    return successResponse(null, 'Material deleted successfully');
  } catch (error) {
    console.error('Material DELETE error:', error);
    return errorResponse('Failed to delete material', 'SERVER_ERROR', 500);
  }
}
