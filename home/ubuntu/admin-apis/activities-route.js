// File: app/api/admin/instructor-activities/route.js and app/api/admin/student-activities/route.js

import dbConnect from '@/dbConnect';
import InstructorActivity from '@/models/InstructorActivity';
import StudentActivity from '@/models/StudentActivity';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
  handleDbError
} from '@/middleware/admin';

// ============= INSTRUCTOR ACTIVITIES =============

// GET - Retrieve instructor activities
export async function GET_INSTRUCTOR(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter query
    const filter = {};
    
    if (search) {
      // Search by instructor name - need to join with User collection
      const instructors = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Instructor'
      }).select('_id').lean();

      if (instructors.length > 0) {
        filter.instructor = { $in: instructors.map(i => i._id) };
      }
    }

    if (status) {
      filter.status = status;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await InstructorActivity.countDocuments(filter);

    // Get paginated results
    const activities = await InstructorActivity.find(filter)
      .populate('instructor', 'name email department')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transform data to match frontend expectations
    const transformedActivities = activities.map(activity => ({
      id: activity._id,
      instructorName: activity.instructor?.name || 'Unknown',
      instructorId: activity.instructor?._id,
      mdbReplies: activity.activityType === 'MDB Replies' ? activity.count : 0,
      gdbMarking: activity.activityType === 'GDB Marking' ? activity.count : 0,
      assignmentUploads: activity.activityType === 'Assignment Upload' ? activity.count : 0,
      assignmentMarking: activity.activityType === 'Assignment Marking' ? activity.count : 0,
      ticketHandling: activity.activityType === 'Ticket Handling' ? activity.count : 0,
      emailResponses: activity.activityType === 'Email Responses' ? activity.count : 0,
      status: activity.status,
      date: activity.date
    }));

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { activities: transformedActivities, pagination },
      'Instructor activities retrieved successfully'
    );
  } catch (error) {
    console.error('Get instructor activities error:', error);
    return errorResponse('Failed to retrieve instructor activities', 'SERVER_ERROR', 500);
  }
}

// GET - Get instructor activities summary
export async function GET_INSTRUCTOR_SUMMARY(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    // Get all instructor activities
    const activities = await InstructorActivity.find()
      .populate('instructor', 'name')
      .lean();

    // Calculate totals
    const totals = {
      totalMdbReplies: 0,
      totalGdbMarking: 0,
      totalAssignmentUploads: 0,
      totalAssignmentMarking: 0,
      totalTicketHandling: 0,
      totalEmailResponses: 0
    };

    activities.forEach(activity => {
      switch (activity.activityType) {
        case 'MDB Replies':
          totals.totalMdbReplies += activity.count;
          break;
        case 'GDB Marking':
          totals.totalGdbMarking += activity.count;
          break;
        case 'Assignment Upload':
          totals.totalAssignmentUploads += activity.count;
          break;
        case 'Assignment Marking':
          totals.totalAssignmentMarking += activity.count;
          break;
        case 'Ticket Handling':
          totals.totalTicketHandling += activity.count;
          break;
        case 'Email Responses':
          totals.totalEmailResponses += activity.count;
          break;
      }
    });

    // Create chart data
    const chartData = activities
      .filter((activity, index, self) => 
        self.findIndex(a => a.instructor?._id === activity.instructor?._id) === index
      )
      .map(activity => ({
        name: activity.instructor?.name?.split(' ')[0] || 'Unknown',
        mdbReplies: activities
          .filter(a => a.instructor?._id === activity.instructor?._id && a.activityType === 'MDB Replies')
          .reduce((sum, a) => sum + a.count, 0),
        assignmentMarking: activities
          .filter(a => a.instructor?._id === activity.instructor?._id && a.activityType === 'Assignment Marking')
          .reduce((sum, a) => sum + a.count, 0),
        emailResponses: activities
          .filter(a => a.instructor?._id === activity.instructor?._id && a.activityType === 'Email Responses')
          .reduce((sum, a) => sum + a.count, 0)
      }));

    return successResponse(
      { ...totals, chartData },
      'Instructor activities summary retrieved successfully'
    );
  } catch (error) {
    console.error('Get instructor activities summary error:', error);
    return errorResponse('Failed to retrieve instructor activities summary', 'SERVER_ERROR', 500);
  }
}

// ============= STUDENT ACTIVITIES =============

// GET - Retrieve student activities
export async function GET_STUDENT(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter query
    const filter = {};
    
    if (search) {
      // Search by student name - need to join with User collection
      const students = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Student'
      }).select('_id').lean();

      if (students.length > 0) {
        filter.student = { $in: students.map(s => s._id) };
      }
    }

    if (status) {
      filter.status = status;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await StudentActivity.countDocuments(filter);

    // Get paginated results
    const activities = await StudentActivity.find(filter)
      .populate('student', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transform data to match frontend expectations
    const transformedActivities = activities.map(activity => ({
      id: activity._id,
      studentName: activity.student?.name || 'Unknown',
      studentId: activity.student?._id,
      assignmentSubmission: activity.activityType === 'Assignment Submission' ? activity.value : 0,
      attendance: activity.activityType === 'Attendance' ? activity.value : 0,
      materialDownloads: activity.activityType === 'Material Download' ? activity.value : 0,
      quizAttempts: activity.activityType === 'Quiz Attempt' ? activity.value : 0,
      status: activity.status,
      date: activity.date
    }));

    const pagination = calculatePagination(total, page, limit);

    return successResponse(
      { activities: transformedActivities, pagination },
      'Student activities retrieved successfully'
    );
  } catch (error) {
    console.error('Get student activities error:', error);
    return errorResponse('Failed to retrieve student activities', 'SERVER_ERROR', 500);
  }
}

// GET - Get student activities summary
export async function GET_STUDENT_SUMMARY(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();

    // Get all student activities
    const activities = await StudentActivity.find()
      .populate('student', 'name')
      .lean();

    // Calculate totals
    let totalSubmissions = 0;
    let totalAttendance = 0;
    let totalDownloads = 0;
    let totalQuizAttempts = 0;
    let attendanceCount = 0;

    activities.forEach(activity => {
      switch (activity.activityType) {
        case 'Assignment Submission':
          totalSubmissions += activity.value || 0;
          break;
        case 'Attendance':
          totalAttendance += activity.value || 0;
          attendanceCount++;
          break;
        case 'Material Download':
          totalDownloads += activity.value || 0;
          break;
        case 'Quiz Attempt':
          totalQuizAttempts += activity.value || 0;
          break;
      }
    });

    const averageAttendance = attendanceCount > 0 
      ? Math.round(totalAttendance / attendanceCount)
      : 0;

    // Create chart data
    const chartData = activities
      .filter((activity, index, self) => 
        self.findIndex(a => a.student?._id === activity.student?._id) === index
      )
      .map(activity => ({
        name: activity.student?.name?.split(' ')[0] || 'Unknown',
        submissions: activities
          .filter(a => a.student?._id === activity.student?._id && a.activityType === 'Assignment Submission')
          .reduce((sum, a) => sum + (a.value || 0), 0),
        downloads: activities
          .filter(a => a.student?._id === activity.student?._id && a.activityType === 'Material Download')
          .reduce((sum, a) => sum + (a.value || 0), 0),
        quizAttempts: activities
          .filter(a => a.student?._id === activity.student?._id && a.activityType === 'Quiz Attempt')
          .reduce((sum, a) => sum + (a.value || 0), 0)
      }));

    return successResponse(
      {
        totalSubmissions,
        averageAttendance,
        totalDownloads,
        totalQuizAttempts,
        chartData
      },
      'Student activities summary retrieved successfully'
    );
  } catch (error) {
    console.error('Get student activities summary error:', error);
    return errorResponse('Failed to retrieve student activities summary', 'SERVER_ERROR', 500);
  }
}
