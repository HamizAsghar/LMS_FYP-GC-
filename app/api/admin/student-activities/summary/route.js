import dbConnect from '@/dbConnect';
import StudentActivity from '@/models/StudentActivity';
import Submission from '@/models/Submission';
import Material from '@/models/Material';
import AssignedClass from '@/models/AssignedClass';
import User from '@/models/User';
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
    const activities = await StudentActivity.find().populate('student', 'name').lean();

    // Calculate real stats for the top cards
    const totalSubmissions = await Submission.countDocuments();
    
    const allMaterialsTotal = await Material.find().select('stats').lean();
    const totalDownloads = allMaterialsTotal.reduce((acc, m) => acc + (m.stats || 0), 0);
    
    // We can still use StudentActivity for attendance and quiz attempts if they don't have separate collections
    let totalAttendance = 0;
    let attendanceCount = 0;
    let totalQuizAttempts = 0;

    activities.forEach((a) => {
      const val = Number(a.value) || 0;
      switch (a.activityType) {
        case 'Attendance':
          totalAttendance += val;
          attendanceCount++;
          break;
        case 'Quiz Attempt':
          totalQuizAttempts += val;
          break;
      }
    });

    // We want a realistic metric calculation for the graph.
    const studentIds = [...new Set(activities.map((a) => a.student?._id?.toString()).filter(Boolean))];
    
    // Fetch all submissions for these students to determine late vs on-time
    const allSubmissions = await Submission.find({ student: { $in: studentIds } }).lean();
    
    // Fetch all assigned classes to know which materials are available to which student
    const allAssignedClasses = await AssignedClass.find({ enrolledStudents: { $in: studentIds } }).lean();
    const classIds = allAssignedClasses.map(c => c._id.toString());
    
    // Fetch materials for these classes
    const allMaterials = await Material.find({ course: { $in: classIds } }).lean();

    const chartData = studentIds.map((id) => {
      const acts = activities.filter((a) => a.student?._id?.toString() === id);
      const studentName = acts[0]?.student?.name?.split(' ')[0] || 'Unknown';
      
      const studentSubmissions = allSubmissions.filter(s => s.student?.toString() === id);
      const onTimeSubmissions = studentSubmissions.filter(s => s.status !== 'Late').length;
      const lateSubmissions = studentSubmissions.filter(s => s.status === 'Late').length;
      
      const studentClasses = allAssignedClasses.filter(c => 
        c.enrolledStudents.map(sId => sId.toString()).includes(id)
      ).map(c => c._id.toString());
      
      const totalMaterialsAvailable = allMaterials.filter(m => 
        m.course && studentClasses.includes(m.course.toString())
      ).length;
      
      const downloads = acts
        .filter((a) => a.activityType === 'Material Download')
        .length;
        
      const notDownloaded = Math.max(0, totalMaterialsAvailable - downloads);
      
      const quizAttempts = acts
        .filter((a) => a.activityType === 'Quiz Attempt')
        .reduce((s, a) => s + (Number(a.value) || 0), 0);

      return {
        name: studentName,
        onTimeSubmissions,
        lateSubmissions,
        downloads,
        notDownloaded,
        quizAttempts,
      };
    });

    return successResponse(
      {
        totalSubmissions,
        averageAttendance: attendanceCount ? Math.round(totalAttendance / attendanceCount) : 0,
        totalDownloads,
        totalQuizAttempts,
        chartData,
      },
      'Student activities summary retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching student activities summary:', error);
    return errorResponse('Failed to retrieve summary', 'SERVER_ERROR', 500);
  }
}
