import dbConnect from '@/dbConnect';
import InstructorActivity from '@/models/InstructorActivity';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const activities = await InstructorActivity.find().populate('instructor', 'name').lean();

    const totals = {
      totalMdbReplies: 0,
      totalGdbMarking: 0,
      totalAssignmentUploads: 0,
      totalAssignmentMarking: 0,
      totalTicketHandling: 0,
      totalEmailResponses: 0,
    };

    activities.forEach((a) => {
      switch (a.activityType) {
        case 'MDB Replies':
          totals.totalMdbReplies += a.count;
          break;
        case 'GDB Marking':
          totals.totalGdbMarking += a.count;
          break;
        case 'Assignment Upload':
          totals.totalAssignmentUploads += a.count;
          break;
        case 'Assignment Marking':
          totals.totalAssignmentMarking += a.count;
          break;
        case 'Ticket Handling':
          totals.totalTicketHandling += a.count;
          break;
        case 'Email Responses':
          totals.totalEmailResponses += a.count;
          break;
      }
    });

    const instructorIds = [...new Set(activities.map((a) => a.instructor?._id?.toString()).filter(Boolean))];
    const chartData = instructorIds.map((id) => {
      const instActs = activities.filter((a) => a.instructor?._id?.toString() === id);
      return {
        name: instActs[0]?.instructor?.name?.split(' ')[0] || 'Unknown',
        mdbReplies: instActs.filter((a) => a.activityType === 'MDB Replies').reduce((s, a) => s + a.count, 0),
        assignmentMarking: instActs
          .filter((a) => a.activityType === 'Assignment Marking')
          .reduce((s, a) => s + a.count, 0),
        emailResponses: instActs
          .filter((a) => a.activityType === 'Email Responses')
          .reduce((s, a) => s + a.count, 0),
      };
    });

    return successResponse({ ...totals, chartData }, 'Summary retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve summary', 'SERVER_ERROR', 500);
  }
}
