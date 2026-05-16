import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import InstructorActivity from '@/models/InstructorActivity';
import Course from '@/models/Course';
import {
  instructorAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const instructorId = authResult.user.id;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly';

    const now = new Date();
    
    let currentPeriodStart = new Date();
    let previousPeriodStart = new Date();
    
    if (period === 'weekly') {
      currentPeriodStart.setDate(now.getDate() - 7);
      previousPeriodStart.setDate(now.getDate() - 14);
    } else if (period === 'semester') {
      currentPeriodStart.setMonth(now.getMonth() - 4);
      previousPeriodStart.setMonth(now.getMonth() - 8);
    } else {
      currentPeriodStart.setMonth(now.getMonth() - 1);
      previousPeriodStart.setMonth(now.getMonth() - 2);
    }

    // 1. Fetch activities for current and previous period
    const currentActivities = await InstructorActivity.find({ 
      instructor: instructorId, 
      date: { $gte: currentPeriodStart, $lt: now } 
    }).lean();

    const previousActivities = await InstructorActivity.find({ 
      instructor: instructorId, 
      date: { $gte: previousPeriodStart, $lt: currentPeriodStart } 
    }).lean();

    // 2. Compute Activity Summary
    const activityTypes = [
      "MDB Replies", "GDB Marking", "Assignment Upload", 
      "Assignment Marking", "Ticket Handling", "Email Responses"
    ];
    
    const activitySummary = activityTypes.map(type => {
      const current = currentActivities.filter(a => a.activityType === type).reduce((sum, a) => sum + (a.count || 1), 0);
      const prev = previousActivities.filter(a => a.activityType === type).reduce((sum, a) => sum + (a.count || 1), 0);
      
      let change = 0;
      if (prev > 0) {
        change = ((current - prev) / prev) * 100;
      } else if (current > 0) {
        change = 100;
      }

      return {
        type: type,
        thisMonth: current,
        lastMonth: prev,
        change: Number(change.toFixed(1))
      };
    });

    // 3. Compute Weekly Data (for the chart) - just distribute current activities into 4 weeks
    const weeklyData = [
      { week: "Week 1", mdbReplies: 0, gdbMarking: 0, assignments: 0, tickets: 0 },
      { week: "Week 2", mdbReplies: 0, gdbMarking: 0, assignments: 0, tickets: 0 },
      { week: "Week 3", mdbReplies: 0, gdbMarking: 0, assignments: 0, tickets: 0 },
      { week: "Week 4", mdbReplies: 0, gdbMarking: 0, assignments: 0, tickets: 0 },
    ];
    
    const periodDuration = now.getTime() - currentPeriodStart.getTime();
    currentActivities.forEach(act => {
      const actTime = new Date(act.date).getTime();
      const relativeTime = actTime - currentPeriodStart.getTime();
      const weekIndex = Math.min(3, Math.floor((relativeTime / periodDuration) * 4));
      
      const count = act.count || 1;
      if (act.activityType === "MDB Replies") weeklyData[weekIndex].mdbReplies += count;
      if (act.activityType === "GDB Marking") weeklyData[weekIndex].gdbMarking += count;
      if (act.activityType === "Assignment Upload" || act.activityType === "Assignment Marking") weeklyData[weekIndex].assignments += count;
      if (act.activityType === "Ticket Handling") weeklyData[weekIndex].tickets += count;
    });

    // 4. Course Performance
    const courses = await Course.find({ instructor: instructorId }).lean();
    
    const coursePerformance = await Promise.all(courses.map(async (course) => {
      const assignments = await Assignment.find({ course: course._id }).select('_id totalMarks').lean();
      const assignmentIds = assignments.map(a => a._id);
      
      const submissions = await Submission.find({ assignment: { $in: assignmentIds } }).lean();
      
      const totalStudents = course.students || 0;
      const expectedSubmissions = totalStudents * assignments.length;
      
      let avgGrade = 0;
      const gradedSubs = submissions.filter(s => s.status === 'Graded' && s.marks != null);
      if (gradedSubs.length > 0) {
        let totalPct = 0;
        gradedSubs.forEach(s => {
          const a = assignments.find(ass => ass._id.toString() === s.assignment.toString());
          const maxMarks = a ? (a.totalMarks || 100) : 100;
          totalPct += (s.marks / maxMarks) * 100;
        });
        avgGrade = Math.round(totalPct / gradedSubs.length);
      }
      
      let completion = 0;
      if (expectedSubmissions > 0) {
        completion = Math.round((submissions.length / expectedSubmissions) * 100);
      }

      return {
        course: `${course.code}`,
        name: course.name,
        students: totalStudents,
        avgGrade,
        submissions: submissions.length,
        completion: Math.min(100, completion)
      };
    }));

    // 5. Overview Stats
    const overview = {
      totalActivities: currentActivities.reduce((sum, a) => sum + (a.count || 1), 0),
      activitiesTrend: activitySummary.reduce((sum, a) => sum + a.change, 0) / activityTypes.length,
      assignmentsMarked: currentActivities.filter(a => a.activityType === "Assignment Marking").reduce((sum, a) => sum + (a.count || 1), 0),
      assignmentsMarkedTrend: activitySummary.find(a => a.type === "Assignment Marking")?.change || 0,
      activeStudents: courses.reduce((sum, c) => sum + (c.students || 0), 0),
      activeStudentsTrend: 5, // Static fallback
      avgResponseTime: "2.4h", // Static fallback
      avgResponseTrend: -15
    };

    const user = await (await import('@/models/User')).default.findById(instructorId).select('name email').lean();

    return successResponse(
      {
        user,
        overview,
        activitySummary,
        weeklyData,
        coursePerformance
      },
      'Instructor reports retrieved successfully'
    );
  } catch (error) {
    console.error('Reports API Error:', error);
    return errorResponse('Failed to retrieve reports', 'SERVER_ERROR', 500);
  }
}
