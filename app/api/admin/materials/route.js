import dbConnect from '@/dbConnect';
import LearningMaterial from '@/models/LearningMaterial';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
  handleDbError,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const type = searchParams.get('type');
    const course = searchParams.get('course');
    if (type) filter.type = type;
    if (course) filter.course = course;

    const total = await LearningMaterial.countDocuments(filter);
    const materials = await LearningMaterial.find(filter)
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return successResponse(
      { materials, pagination: calculatePagination(total, page, limit) },
      'Learning materials retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve materials', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.type || !body.course) {
      return errorResponse('title, type, and course are required', 'VALIDATION_ERROR', 400);
    }

    const material = await LearningMaterial.create({
      title: body.title,
      type: body.type,
      course: body.course,
      uploadedBy: authResult.user.id,
      fileUrl: body.fileUrl || '',
      size: body.size || '',
    });

    await material.populate(['course', 'uploadedBy']);
    return successResponse(material, 'Material uploaded successfully', 201);
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
