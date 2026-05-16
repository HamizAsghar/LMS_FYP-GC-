// app/api/instructor/materials/route.js
import dbConnect from '@/dbConnect';
import Material from '@/models/Material';
import Course from '@/models/Course';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';
import { uploadToCloudinary } from '@/utils/cloudinary';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) return errorResponse(authResult.message, authResult.error, authResult.status);
    const instructorId = authResult.user.id;
    await dbConnect();

    const [user, materials] = await Promise.all([
      // Fetch instructor user info
      // Assuming a User model exists
      (await import('@/models/User')).default.findById(instructorId).select('name email').lean(),
      Material.find({ instructor: instructorId })
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Transform material objects for the frontend
    const formatted = materials.map(m => ({
      _id: m._id,
      title: m.title,
      course: `${m.course?.code || ''} - ${m.course?.name || ''}`,
      courseId: m.course?._id,
      type: m.type,
      size: m.size,
      description: m.description,
      uploadedAt: m.uploadedAt.toISOString().split('T')[0],
      stats: m.stats,
      fileUrl: m.fileUrl,
    }));

    return successResponse({ user, materials: formatted }, 'Materials retrieved');
  } catch (error) {
    console.error('Materials GET error:', error);
    return errorResponse('Failed to get materials', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) return errorResponse(authResult.message, authResult.error, authResult.status);
    const instructorId = authResult.user.id;
    await dbConnect();

    const formData = await req.formData();
    const title = formData.get('title');
    const courseId = formData.get('course');
    const description = formData.get('description') || '';
    const file = formData.get('file');

    if (!title || !courseId) return errorResponse('Title and Course are required', 'VALIDATION_ERROR', 400);

    let fileUrl = '';
    let size = '';
    let type = 'Other';
    if (file && typeof file !== 'string') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: 'eduhub/materials' });
      fileUrl = result.secure_url;
      size = `${(result.bytes / 1024 / 1024).toFixed(2)} MB`;
      const ext = result.format?.toLowerCase();
      if (['pdf'].includes(ext)) type = 'PDF';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) type = 'Video';
      else if (['ppt', 'pptx', 'key'].includes(ext)) type = 'Presentation';
    }

    const newMaterial = await Material.create({
      title,
      course: courseId,
      type,
      size,
      fileUrl,
      description,
      instructor: instructorId,
    });

    return successResponse({ materialId: newMaterial._id }, 'Material uploaded', 201);
  } catch (error) {
    console.error('Materials POST error:', error);
    return errorResponse('Failed to upload material', 'SERVER_ERROR', 500);
  }
}
