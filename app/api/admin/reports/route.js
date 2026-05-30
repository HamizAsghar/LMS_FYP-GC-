import dbConnect from '@/dbConnect';
import Report from '@/models/Report';
import User from '@/models/User';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import InstructorActivity from '@/models/InstructorActivity';
import StudentActivity from '@/models/StudentActivity';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
} from '@/middleware/admin';

async function buildAnalytics(period = 'monthly') {
  const now = new Date();
  let start = new Date();
  if (period === 'weekly') start.setDate(now.getDate() - 7);
  else if (period === 'semester') start.setMonth(now.getMonth() - 4);
  else start.setMonth(now.getMonth() - 1);

  const [
    totalUsers,
    totalCourses,
    totalAssignments,
    submissionsCount,
    instructorActivitiesCount,
    studentActivitiesCount,
    submissionsList,
    activitiesList,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Assignment.countDocuments(),
    Submission.countDocuments({ submittedDate: { $gte: start } }),
    InstructorActivity.countDocuments({ date: { $gte: start } }),
    StudentActivity.countDocuments({ date: { $gte: start } }),
    Submission.find({ submittedDate: { $gte: start } })
      .populate('student', 'name email')
      .populate('assignment', 'title')
      .sort({ submittedDate: -1 })
      .lean(),
    StudentActivity.find({
      date: { $gte: start },
      activityType: { $ne: 'Assignment Submission' } // Avoid duplicate logs
    })
      .populate('student', 'name email')
      .sort({ date: -1 })
      .lean(),
  ]);

  const submissions = submissionsCount;
  const instructorActivities = instructorActivitiesCount;
  // Combine submission counts and other student activities for total student activities count
  const studentActivities = submissionsCount + studentActivitiesCount;

  const assignmentCompletion = await Submission.aggregate([
    { $match: { submittedDate: { $gte: start } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const studentActivitiesList = [
    ...submissionsList.map(s => ({
      id: s._id.toString(),
      studentName: s.student?.name || 'Unknown',
      studentEmail: s.student?.email || '',
      activityType: 'Assignment Submission',
      itemName: s.assignment?.title || 'Unknown Assignment',
      status: s.status || 'Submitted',
      date: s.submittedDate || s.createdAt,
      remarks: s.feedback || `Submitted assignment "${s.assignment?.title || ''}"`
    })),
    ...activitiesList.map(a => ({
      id: a._id.toString(),
      studentName: a.student?.name || 'Unknown',
      studentEmail: a.student?.email || '',
      activityType: a.activityType,
      itemName: a.value || 'N/A',
      status: a.status || 'Completed',
      date: a.date || a.createdAt,
      remarks: a.remarks || `${a.activityType}: ${a.value || ''}`
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    period,
    performanceCards: {
      totalUsers,
      totalCourses,
      totalAssignments,
      submissions,
      instructorActivities,
      studentActivities,
    },
    activityTrends: { instructorActivities, studentActivities },
    assignmentCompletion,
    studentActivitiesList,
    generatedAt: now,
  };
}

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly';

    if (searchParams.get('analytics') === 'true') {
      const analytics = await buildAnalytics(period);
      return successResponse(analytics, 'Analytics retrieved successfully');
    }

    const { page, limit, sortBy, sortOrder } = parseQueryParams(searchParams);
    const type = searchParams.get('type');
    const filter = type ? { type } : {};

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('generatedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return successResponse(
      { reports, pagination: calculatePagination(total, page, limit) },
      'Reports retrieved successfully'
    );
  } catch (error) {
    console.error('Failed to retrieve reports:', error);
    return errorResponse('Failed to retrieve reports', 'SERVER_ERROR', 500);
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
    const period = body.period || 'monthly';
    const typeMap = { weekly: 'Weekly', monthly: 'Monthly', semester: 'Semester' };
    const reportType = typeMap[period] || body.type || 'Monthly';

    const data = await buildAnalytics(period);
    const report = await Report.create({
      title: body.title || `${reportType} Report - ${new Date().toLocaleDateString()}`,
      type: reportType,
      generatedBy: authResult.user.id,
      period,
      data,
    });

    await report.populate('generatedBy', 'name email');
    return successResponse(report, 'Report generated successfully', 201);
  } catch (error) {
    console.error('Failed to generate report:', error);
    return errorResponse('Failed to generate report', 'SERVER_ERROR', 500);
  }
}
