import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sections = searchParams.get('sections')?.split(',');

    if (!classId || !sections) {
      return NextResponse.json({ success: false, message: "Missing classId or sections" }, { status: 400 });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
    }

    const allSubjects = cls.subjects;
    
    // Find all assigned subjects for the selected class and any of the selected sections
    const assigned = await AssignedClass.find({
      classId,
      section: { $in: sections }
    });

    const assignedSubjects = assigned.map(a => a.subject);
    const availableSubjects = allSubjects.filter(sub => !assignedSubjects.includes(sub));

    return NextResponse.json({ success: true, availableSubjects }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
