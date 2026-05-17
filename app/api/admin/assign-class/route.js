import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { teacherId, classId, subject, sections, credentials } = body;

    if (!teacherId || !classId || !subject || !sections || !credentials) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const assignments = [];
    for (const section of sections) {
      const existing = await AssignedClass.findOne({ classId, section, subject });
      if (existing) {
        return NextResponse.json({ success: false, message: `Subject ${subject} for section ${section} is already assigned.` }, { status: 400 });
      }

      const assignment = await AssignedClass.create({
        teacherId,
        classId,
        section,
        subject,
        credentials
      });
      assignments.push(assignment);
    }

    return NextResponse.json({ success: true, assignments }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
