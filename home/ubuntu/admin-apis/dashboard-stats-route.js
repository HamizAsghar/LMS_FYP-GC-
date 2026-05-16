// File: app/api/admin/dashboard/stats/route.js

import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import ActivityLog from '@/models/ActivityLog';
import { NextResponse } from 'next/server';
import { adminAuthMiddleware, errorResponse, successResponse } from '@/middleware/admin';

export async function GET(req) {
  try {
    // Verify authentication
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'Instructor' });
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const activeUsers = await User.countDocuments({ status: 'Active' });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'Active' });

    // Get assignment statistics
    const totalAssignments = await Assignment.countDocuments();
    const activeAssignments = await Assignment.countDocuments({ status: 'Active' });

    // Get submission statistics
    const totalSubmissions = await Submission.countDocuments();
    const submittedSubmissions = await Submission.countDocuments({ status: 'Submitted' });
    const gradedSubmissions = await Submission.countDocuments({ status: 'Graded' });
    const pendingSubmissions = await Submission.countDocuments({ status: 'Pending' });
    const lateSubmissions = await Submission.countDocuments({ status: 'Late' });

    // Get activity statistics
    const totalActivities = await ActivityLog.countDocuments();
    const thisMonthActivities = await ActivityLog.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setDate(1))
      }
    });

    // Calculate growth metrics
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);

    const lastMonthUsers = await User.countDocuments({
      joinedDate: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      }
    });

    const thisMonthUsers = await User.countDocuments({
      joinedDate: {
        $gte: new Date(new Date().setDate(1))
      }
    });

    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0;

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalCourses,
      activeCourses,
      completedCourses: await Course.countDocuments({ status: 'Completed' }),
      totalAssignments,
      activeAssignments,
      totalSubmissions,
      submittedSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      lateSubmissions,
      submissionRate: totalAssignments > 0 
        ? ((submittedSubmissions + gradedSubmissions + lateSubmissions) / (totalAssignments * totalStudents) * 100).toFixed(1)
        : 0,
      totalActivities,
      thisMonthActivities,
      monthlyGrowth: parseFloat(userGrowth)
    };

    return successResponse(stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to retrieve dashboard statistics', 'SERVER_ERROR', 500);
  }
}
