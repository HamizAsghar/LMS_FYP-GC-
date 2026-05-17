import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Class from '@/models/Class';

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { classId, className, program, semester, sections, subjects } = body;

    if (!classId) {
      return NextResponse.json({ success: false, message: "classId is required" }, { status: 400 });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { className, program, semester, sections, subjects },
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, class: updatedClass }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
