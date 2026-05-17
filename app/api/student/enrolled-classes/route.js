import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import { studentAuthMiddleware } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
    }

    const studentId = authResult.user.id;

    await dbConnect();
    
    // Ensure models are registered
    if (!Class) console.log("Models loaded");

    const enrolledClasses = await AssignedClass.find({ enrolledStudents: studentId })
      .populate('teacherId', 'name email')
      .populate('classId', 'program className semester')
      .sort({ createdAt: -1 });

    const formatted = enrolledClasses.map(ac => ({
      _id: ac._id,
      teacherName: ac.teacherId?.name || "Unknown Instructor",
      subject: ac.subject,
      section: ac.section,
      program: ac.classId?.program,
      semester: ac.classId?.semester,
      className: ac.classId?.className,
      enrolledAt: ac.createdAt
    }));

    return NextResponse.json({ success: true, enrolledClasses: formatted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
