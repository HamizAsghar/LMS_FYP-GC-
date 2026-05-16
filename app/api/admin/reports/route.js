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
    submissions,
    instructorActivities,
    studentActivities,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Assignment.countDocuments(),
    Submission.countDocuments({ submittedDate: { $gte: start } }),
    InstructorActivity.countDocuments({ date: { $gte: start } }),
    StudentActivity.countDocuments({ date: { $gte: start } }),
  ]);

  const assignmentCompletion = await Submission.aggregate([
    { $match: { submittedDate: { $gte: start } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

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
    return errorResponse('Failed to generate report', 'SERVER_ERROR', 500);
  }
}
