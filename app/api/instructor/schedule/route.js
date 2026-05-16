import dbConnect from '@/dbConnect';
import Schedule from '@/models/Schedule';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let query = { scheduledBy: instructorId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.startTime = { $gte: startDate, $lt: endDate };
    }

    const schedule = await Schedule.find(query).sort({ startTime: 1 });

    return successResponse(schedule, 'Schedule retrieved successfully');
  } catch (error) {
    console.error('Instructor schedule error:', error);
    return errorResponse('Failed to retrieve schedule', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    const body = await req.json();

    await dbConnect();

    const newSchedule = await Schedule.create({
      ...body,
      scheduledBy: instructorId
    });

    return successResponse(newSchedule, 'Schedule item created successfully', 201);
  } catch (error) {
    console.error('Create schedule error:', error);
    return errorResponse('Failed to create schedule item', 'SERVER_ERROR', 500);
  }
}
