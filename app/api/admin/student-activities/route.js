import dbConnect from '@/dbConnect';
import StudentActivity from '@/models/StudentActivity';
import Submission from '@/models/Submission';
import User from '@/models/User';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
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

    const submissionFilter = {};
    const activityFilter = { activityType: { $ne: 'Assignment Submission' } };

    const status = searchParams.get('status');
    if (status && status !== 'all') {
      activityFilter.status = status;
      if (status === 'Completed') {
        submissionFilter.status = { $in: ['Submitted', 'Graded'] };
      } else {
        submissionFilter.status = status;
      }
    }

    if (search) {
      const students = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Student',
      }).select('_id');
      const studentIds = students.map((s) => s._id);
      submissionFilter.student = { $in: studentIds };
      activityFilter.student = { $in: studentIds };
    }

    const [submissionsList, activitiesList] = await Promise.all([
      Submission.find(submissionFilter)
        .populate('student', 'name email')
        .populate('assignment', 'title')
        .lean(),
      StudentActivity.find(activityFilter)
        .populate('student', 'name email')
        .lean(),
    ]);

    const mergedList = [
      ...submissionsList.map((s) => ({
        id: s._id.toString(),
        studentName: s.student?.name || 'Unknown',
        studentId: s.student?._id,
        activityType: 'Assignment Submission',
        assignmentSubmission: s.assignment?.title || 'Unknown Assignment',
        attendance: 0,
        materialDownloads: 0,
        quizAttempts: 0,
        status: s.status || 'Submitted',
        date: s.submittedDate || s.createdAt,
        remarks: s.feedback || `Submitted assignment "${s.assignment?.title || ''}"`
      })),
      ...activitiesList.map((a) => ({
        id: a._id.toString(),
        studentName: a.student?.name || 'Unknown',
        studentId: a.student?._id,
        activityType: a.activityType,
        assignmentSubmission: 0,
        attendance: a.activityType === 'Attendance' ? (Number(a.value) || 0) : 0,
        materialDownloads: a.activityType === 'Material Download' ? a.value : 0,
        quizAttempts: a.activityType === 'Quiz Attempt' ? (Number(a.value) || 0) : 0,
        status: a.status || 'Completed',
        date: a.date || a.createdAt,
        remarks: a.remarks || `${a.activityType}: ${a.value || ''}`
      }))
    ];

    // Sort chronologically (default to date descending)
    const sortField = sortBy === 'date' ? 'date' : 'date';
    mergedList.sort((a, b) => {
      const valA = new Date(a[sortField] || 0);
      const valB = new Date(b[sortField] || 0);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = mergedList.length;
    const startIndex = (page - 1) * limit;
    const paginatedActivities = mergedList.slice(startIndex, startIndex + limit);

    return successResponse(
      { activities: paginatedActivities, pagination: calculatePagination(total, page, limit) },
      'Student activities retrieved successfully'
    );
  } catch (error) {
    console.error('Failed to retrieve student activities:', error);
    return errorResponse('Failed to retrieve student activities', 'SERVER_ERROR', 500);
  }
}
