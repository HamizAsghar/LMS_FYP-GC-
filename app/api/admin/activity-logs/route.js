import dbConnect from '@/dbConnect';
import ActivityLog from '@/models/ActivityLog';
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
    const { page, limit, search } = parseQueryParams(searchParams);

    // Fetch from all direct sources of truth in parallel
    const Submission = (await import('@/models/Submission')).default;
    const StudentActivity = (await import('@/models/StudentActivity')).default;
    const Assignment = (await import('@/models/Assignment')).default;
    const Material = (await import('@/models/Material')).default;
    const InstructorActivity = (await import('@/models/InstructorActivity')).default;
    const User = (await import('@/models/User')).default;

    const [
      authLogs, 
      studentSubmissions, 
      studentActivities, 
      instructorAssignments, 
      instructorMaterials,
      instructorGenericLogs,
      gradedSubmissions
    ] = await Promise.all([
      ActivityLog.find().populate('user', 'name email').lean(),
      Submission.find().populate('student', 'name email').populate('assignment', 'title').lean(),
      StudentActivity.find({ activityType: { $ne: 'Assignment Submission' } }).populate('student', 'name email').lean(),
      Assignment.find().populate('instructor', 'name email').lean(),
      Material.find().populate('instructor', 'name email').lean(),
      InstructorActivity.find().populate('instructor', 'name email').lean(),
      Submission.find({ 
        $or: [
          { status: 'Graded' },
          { marks: { $exists: true, $ne: null } }
        ] 
      }).populate('student', 'name email').populate('assignment', 'title instructor').lean()
    ]);

    // 1. Format Login Activities
    const formattedAuth = authLogs.map(l => ({
      _id: l._id,
      user: l.user,
      role: l.role || 'User',
      action: l.action || 'Login',
      target: l.target || 'Login successful',
      timestamp: l.timestamp || l.createdAt || new Date(),
      ipAddress: l.ipAddress || '—'
    }));

    // 2. Format Student Submissions (Real-time Submission Logs)
    const formattedSubmissions = studentSubmissions.map(s => ({
      _id: s._id,
      user: s.student,
      role: 'Student',
      action: 'Submitted',
      target: `Assignment: ${s.assignment?.title || 'Assignment'}`,
      timestamp: s.submittedDate || s.createdAt || new Date(),
      ipAddress: '—'
    }));

    // 3. Format Student Activities (Downloads, Enrollments, etc)
    const formattedStudent = studentActivities.map(s => {
      let act = 'Activity';
      if (s.activityType === 'Course Enrollment') act = 'Enrolled';
      else if (s.activityType === 'Material Download') act = 'Downloaded';
      else if (s.activityType === 'Quiz Attempt') act = 'Quiz';
      
      return {
        _id: s._id,
        user: s.student,
        role: 'Student',
        action: act,
        target: `${s.activityType}: ${s.value || s.remarks || '—'}`,
        timestamp: s.date || s.createdAt || new Date(),
        ipAddress: '—'
      };
    });

    // 4. Format Instructor Assignment Creation
    const formattedAssignments = instructorAssignments.map(a => ({
      _id: a._id,
      user: a.instructor,
      role: 'Instructor',
      action: 'Created',
      target: `Assignment: ${a.title}`,
      timestamp: a.createdAt || new Date(),
      ipAddress: '—'
    }));

    // 5. Format Instructor Material Uploads
    const formattedMaterials = instructorMaterials.map(m => ({
      _id: m._id,
      user: m.instructor,
      role: 'Instructor',
      action: 'Created',
      target: `Material: ${m.title}`,
      timestamp: m.uploadedAt || m.createdAt || new Date(),
      ipAddress: '—'
    }));

    // 6. Format Instructor Generic Logs (Replies, discussion activities, etc)
    const formattedInstructorGeneric = instructorGenericLogs.map(i => {
      let act = 'Updated';
      if (i.activityType.includes('Upload')) act = 'Created';
      return {
        _id: i._id,
        user: i.instructor,
        role: 'Instructor',
        action: act,
        target: `${i.activityType}${i.remarks ? ` - ${i.remarks}` : ''}`,
        timestamp: i.date || i.createdAt || new Date(),
        ipAddress: '—'
      };
    });

    // 7. Format Instructor Grading Updates (Marking Logs)
    const formattedGrading = await Promise.all(
      gradedSubmissions.map(async (g) => {
        const instructorUser = g.assignment?.instructor 
          ? await User.findById(g.assignment.instructor).select('name email').lean() 
          : null;
        
        return {
          _id: `grade-${g._id}`,
          user: instructorUser,
          role: 'Instructor',
          action: 'Updated',
          target: `Graded Assignment: ${g.assignment?.title || 'Assignment'} (Student: ${g.student?.name || 'Student'})`,
          timestamp: g.updatedAt || g.createdAt || new Date(),
          ipAddress: '—'
        };
      })
    );

    // Merge all lists
    let allLogs = [
      ...formattedAuth, 
      ...formattedSubmissions, 
      ...formattedStudent, 
      ...formattedAssignments, 
      ...formattedMaterials, 
      ...formattedInstructorGeneric,
      ...formattedGrading
    ];

    // Filter out duplicates (just in case)
    const seen = new Set();
    allLogs = allLogs.filter(el => {
      if (!el || !el._id) return false;
      const key = el._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by role
    const roleParam = searchParams.get('role');
    if (roleParam && roleParam !== 'all') {
      allLogs = allLogs.filter(l => l.role?.toLowerCase() === roleParam.toLowerCase());
    }

    // Filter by action
    const actionParam = searchParams.get('action');
    if (actionParam && actionParam !== 'all') {
      allLogs = allLogs.filter(l => {
        const act = l.action?.toLowerCase() || '';
        const param = actionParam.toLowerCase();
        if (param === 'submitted') return act === 'submitted';
        if (param === 'created') return act === 'created';
        if (param === 'updated') return act === 'updated';
        if (param === 'login') return act === 'login';
        return act.includes(param);
      });
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      allLogs = allLogs.filter(l => 
        (l.user?.name || '').toLowerCase().includes(q) ||
        (l.user?.email || '').toLowerCase().includes(q) ||
        (l.role || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.target || '').toLowerCase().includes(q)
      );
    }

    // Sort chronologically (newest logs first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate in-memory
    const total = allLogs.length;
    const paginatedLogs = allLogs.slice((page - 1) * limit, page * limit);

    return successResponse(
      { logs: paginatedLogs, pagination: calculatePagination(total, page, limit) },
      'Activity logs retrieved successfully'
    );
  } catch (error) {
    console.error('Failed to retrieve activity logs:', error);
    return errorResponse('Failed to retrieve activity logs', 'SERVER_ERROR', 500);
  }
}
