import dbConnect from '@/dbConnect';
import Material from '@/models/Material';
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
    if (type) {
      let dbTypes = [type];
      if (type.toLowerCase() === 'slides') dbTypes.push('Presentation');
      if (type.toLowerCase() === 'document') dbTypes.push('Other');
      filter.type = { $in: dbTypes.map(t => new RegExp(`^${t}$`, 'i')) };
    }
    if (course) filter.course = course;

    const total = await Material.countDocuments(filter);
    const materials = await Material.find(filter)
      .populate('instructor', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const AssignedClass = (await import('@/models/AssignedClass')).default;
    const CourseModel = (await import('@/models/Course')).default;
    const enriched = await Promise.all(
      materials.map(async (m) => {
        let courseInfo = null;
        const rawMaterial = await Material.findById(m._id).select('course').lean();
        if (rawMaterial && rawMaterial.course) {
          const assignedClass = await AssignedClass.findById(rawMaterial.course)
            .populate('classId', 'program className semester')
            .lean();
          if (assignedClass) {
            const classInfo = assignedClass.classId;
            courseInfo = {
              _id: assignedClass._id,
              code: classInfo ? `${classInfo.program} Sec ${assignedClass.section}` : `Sec ${assignedClass.section}`,
              name: assignedClass.subject || classInfo?.className || 'N/A',
            };
          } else {
            const stdCourse = await CourseModel.findById(rawMaterial.course).select('name code').lean();
            if (stdCourse) {
              courseInfo = {
                _id: stdCourse._id,
                code: stdCourse.code,
                name: stdCourse.name,
              };
            }
          }
        }
        
        let mappedType = m.type || 'Other';
        if (mappedType === 'Presentation') mappedType = 'Slides';
        if (mappedType === 'Other') mappedType = 'Document';

        return {
          ...m,
          course: courseInfo,
          type: mappedType,
          uploadedBy: m.instructor,
          downloads: m.stats || 0,
        };
      })
    );

    return successResponse(
      { materials: enriched, pagination: calculatePagination(total, page, limit) },
      'Learning materials retrieved successfully'
    );
  } catch (error) {
    console.error("Admin GET materials error:", error);
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

    const material = await Material.create({
      title: body.title,
      type: body.type,
      course: body.course,
      instructor: authResult.user.id,
      fileUrl: body.fileUrl || '',
      size: body.size || '',
    });

    await material.populate(['course', 'instructor']);
    return successResponse(material, 'Material uploaded successfully', 201);
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
