import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('eduhub_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production');
    
    await dbConnect();
    // Ensure models are loaded
    if (!Class) console.log("Models loaded");

    const assignedClasses = await AssignedClass.find({ teacherId: decoded.id })
      .populate('classId', 'program className semester sections')
      .sort({ createdAt: -1 });

    const formatted = assignedClasses.map(ac => ({
      _id: ac._id,
      assignedClass: ac.classId?.className,
      classDetails: ac.classId ? {
        classId: ac.classId._id,
        program: ac.classId.program,
        semester: ac.classId.semester,
      } : null,
      section: ac.section,
      subject: ac.subject,
      assignedAt: ac.createdAt
    }));

    return NextResponse.json({ success: true, assignedClasses: formatted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
