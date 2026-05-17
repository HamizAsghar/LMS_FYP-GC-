import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';
import User from '@/models/User';
import Class from '@/models/Class';

export async function GET() {
  try {
    await dbConnect();
    
    // Ensure models are registered
    if (!User || !Class) {
        console.log("Models loaded");
    }

    const assignedClasses = await AssignedClass.find()
      .populate('teacherId', 'name email')
      .populate('classId', 'program className semester sections')
      .sort({ createdAt: -1 });

    const formatted = assignedClasses.map(ac => ({
      _id: ac._id,
      teacherId: ac.teacherId?._id,
      teacherName: ac.teacherId?.name,
      teacherEmail: ac.teacherId?.email,
      assignedClass: ac.classId?.className,
      classDetails: ac.classId ? {
        classId: ac.classId._id,
        program: ac.classId.program,
        semester: ac.classId.semester,
      } : null,
      section: ac.section,
      subject: ac.subject,
      classCredentials: ac.credentials,
      assignedAt: ac.createdAt
    }));

    return NextResponse.json({ success: true, assignedClasses: formatted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
