import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import AssignedClass from '@/models/AssignedClass';
import Student from '@/models/Student';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const profile = await Student.findOne({ userId: authResult.user.id });
    const enrolledIds = profile?.courses || [];

    const [courses, assignedClasses] = await Promise.all([
      Course.find({ _id: { $in: enrolledIds }, status: 'Active' })
        .populate('instructor', 'name email department')
        .lean(),
      AssignedClass.find({ _id: { $in: enrolledIds } })
        .populate('teacherId', 'name email department')
        .populate('classId', 'program className semester')
        .lean(),
    ]);

    const mappedAssigned = assignedClasses.map(ac => ({
      ...ac.classId?.toObject?.() || {},
      classInfo: ac.classId,
      name: ac.subject,
      isAssignedClass: true,
      assignedClassId: ac._id,
      section: ac.section,
      subject: ac.subject,
      instructor: ac.teacherId,
      assignedClass: ac,
    }));

    return successResponse(
      { courses, assignedClasses: mappedAssigned },
      'Enrolled courses retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve courses', 'SERVER_ERROR', 500);
  }
}
