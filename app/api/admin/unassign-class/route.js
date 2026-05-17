import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';

export async function DELETE(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { teacherId, classId, section, subject } = body;

    await AssignedClass.findOneAndDelete({ teacherId, classId, section, subject });

    return NextResponse.json({ success: true, message: "Class unassigned successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
