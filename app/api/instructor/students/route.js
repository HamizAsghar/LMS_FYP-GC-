import dbConnect from '@/dbConnect';
import Student from '@/models/Student';
import Course from '@/models/Course';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import User from '@/models/User';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    // ── 1. Fetch instructor's own courses (Course model) ──────────────────────
    const courses = await Course.find({ instructor: instructorId }).select('_id code name').lean();
    const courseIds = courses.map(c => c._id);

    // ── 2. Fetch instructor's assigned classes (AssignedClass model) ───────────
    const assignedClasses = await AssignedClass.find({ teacherId: instructorId })
      .populate('classId', 'program className semester')
      .lean();
    const assignedClassIds = assignedClasses.map(ac => ac._id);

    // ── 3. Find students enrolled in EITHER Course OR AssignedClass ────────────
    const allEnrolledIds = [...courseIds, ...assignedClassIds];
    const students = await Student.find({ courses: { $in: allEnrolledIds } })
      .populate('userId', 'name email')
      .lean();

    // ── 4. Map all assigned class docs for fast lookup ─────────────────────────
    const assignedClassMap = new Map();
    assignedClasses.forEach(ac => {
      assignedClassMap.set(ac._id.toString(), {
        _id: ac._id,
        code: ac.classId ? `${ac.classId.program} Sec ${ac.section}` : `Sec ${ac.section}`,
        name: ac.subject,
        section: ac.section,
      });
    });

    // ── 5. Map and format student data ─────────────────────────────────────────
    const formattedStudents = await Promise.all(students.map(async (student) => {
      const populatedCourses = student.courses; // already populated from Student schema
      const sCourses = Array.isArray(populatedCourses) ? populatedCourses : [];

      const studentCourseIds = sCourses.map(c => {
        const id = c._id;
        return id ? id.toString() : String(c);
      });

      // Identify instructor-owned courses (Course model + instructor field)
      const instructorCourseDocs = sCourses.filter(
        c => c.instructor && c.instructor.toString() === instructorId.toString()
      );

      // Identify instructor-owned assigned classes (from our map)
      const instructorAssignedClasses = assignedClasses.filter(
        ac => studentCourseIds.includes(ac._id.toString())
      );

      const allInstructorCourses = [...instructorCourseDocs, ...instructorAssignedClasses];

      const courseStr = allInstructorCourses.map(c => {
        if (c.code) {
          return `${c.code} - ${c.name}`;
        }
        return `${c.classId?.program || ''} Sec ${c.section} - ${c.subject}`;
      }).join(', ');

      // Count submissions for this student in instructor's assignments
      const assignmentsForInstructor = await Assignment.find({
        instructor: instructorId,
        course: { $in: allInstructorCourses.map(c => c._id) }
      }).select('_id');
      const assignmentIds = assignmentsForInstructor.map(a => a._id);

      const submittedCount = await Submission.countDocuments({
        student: student.userId._id,
        assignment: { $in: assignmentIds }
      });

      const totalCount = assignmentIds.length;

      return {
        id: student._id,
        userId: student.userId._id,
        name: student.userId.name || 'Unknown Student',
        email: student.userId.email || 'No email',
        rollNo: student.userId._id.toString().substring(18, 24).toUpperCase(),
        course: courseStr || 'N/A',
        attendance: student.attendance || 0,
        grade: 'N/A',
        assignments: {
          submitted: submittedCount,
          total: totalCount
        },
        status: (student.attendance < 75 || submittedCount < totalCount / 2) ? 'At Risk' : 'Active'
      };
    }));

    const user = await User.findById(instructorId).select('name email').lean();

    // Merge regular Course entries and AssignedClass entries into the same courses list
    const coursesForDropdown = [
      ...courses.map(c => ({ _id: c._id, code: c.code, name: c.name, isAssignedClass: false })),
      ...assignedClasses.map(ac => ({
        _id: ac._id,
        code: ac.classId ? `${ac.classId.program} Sec ${ac.section}` : `Sec ${ac.section}`,
        name: ac.subject,
        isAssignedClass: true,
      }))
    ];

    return successResponse({
      students: formattedStudents,
      courses: coursesForDropdown,
      user
    }, 'Students retrieved successfully');
  } catch (error) {
    console.error('Instructor students error:', error);
    return errorResponse('Failed to retrieve students', 'SERVER_ERROR', 500);
  }
}
