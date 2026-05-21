import dbConnect from '@/dbConnect';
import Material from '@/models/Material';
import Course from '@/models/Course';
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

    // Filter materials to only show those uploaded for the student's enrolled courses/classes
    const filter = { course: { $in: courseIds } };
    if (type) {
      let dbTypes = [type];
      if (type.toLowerCase() === 'slides') dbTypes.push('Presentation');
      if (type.toLowerCase() === 'document') dbTypes.push('Other');
      filter.type = { $in: dbTypes.map(t => new RegExp(`^${t}$`, 'i')) };
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const materials = await Material.find(filter)
      .populate({
        path: 'course',
        select: 'name code subject section classId',
        populate: { path: 'classId', select: 'program className' }
      })
      .sort({ uploadedAt: -1 })
      .lean();

    const enrichedMaterials = await Promise.all(materials.map(async (m) => {
      // Fallback to populate standard Course if Mongoose populate returned null (due to ref constraint)
      if (!m.course && m.course !== undefined) {
        const stdCourse = await Course.findById(m.course).select('name code').lean();
        if (stdCourse) {
          m.course = {
            _id: stdCourse._id,
            code: stdCourse.code,
            name: stdCourse.name
          };
        }
      }

      // Map AssignedClass fields to clean code and name for student
      if (m.course && m.course.subject && !m.course.code) {
        const program = m.course.classId?.program || '';
        const section = m.course.section || '';
        m.course.code = program && section ? `${program} Sec ${section}` : 'Class Section';
        m.course.name = m.course.subject;
      }

      // Map material type to frontend friendly categories
      let mappedType = m.type || 'Other';
      if (mappedType === 'Presentation') mappedType = 'Slides';
      if (mappedType === 'Other') mappedType = 'Document';

      return {
        ...m,
        id: m._id.toString(),
        type: mappedType,
        downloads: m.stats || 0,
        uploadedDate: m.uploadedAt
      };
    }));

    return successResponse(enrichedMaterials, 'Materials retrieved successfully');
  } catch (error) {
    console.error('Student retrieve materials error:', error);
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

    // Check if the student has already viewed/downloaded this material to enforce 1 view limit
    const existingActivity = await StudentActivity.findOne({
      student: authResult.user.id,
      activityType: 'Material Download',
      remarks: materialId.toString()
    });

    let material;
    if (existingActivity) {
      // If student already viewed it, don't increment stats, just fetch the details
      material = await Material.findById(materialId);
    } else {
      // First time viewing, increment count and log activity
      material = await Material.findByIdAndUpdate(
        materialId,
        { $inc: { stats: 1 } }, // 'stats' is the download field in Material schema
        { new: true }
      );

      if (material) {
        await StudentActivity.create({
          student: authResult.user.id,
          activityType: 'Material Download',
          value: material.title,
          status: 'Completed',
          remarks: materialId.toString(), // Store the material ID in remarks to track uniqueness
        });

        // Notify the instructor
        try {
          const Notification = (await import('@/models/Notification')).default;
          await Notification.create({
            user: material.instructor,
            type: 'system',
            title: 'Learning Material Downloaded',
            message: `${authResult.user.name || 'A student'} downloaded/viewed "${material.title}".`,
            timestamp: new Date(),
            read: false
          });
        } catch (notifErr) {
          console.error('Failed to create material download notification:', notifErr);
        }
      }
    }

    if (!material) return errorResponse('Material not found', 'NOT_FOUND', 404);

    return successResponse(material, 'Download recorded successfully');
  } catch (error) {
    console.error('Student record download error:', error);
    return errorResponse('Failed to record download', 'SERVER_ERROR', 500);
  }
}
