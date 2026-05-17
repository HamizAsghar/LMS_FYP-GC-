import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Class from '@/models/Class';

export async function DELETE(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { classId } = body;

    if (!classId) {
      return NextResponse.json({ success: false, message: "classId is required" }, { status: 400 });
    }

    await Class.findByIdAndDelete(classId);

    return NextResponse.json({ success: true, message: "Class deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
