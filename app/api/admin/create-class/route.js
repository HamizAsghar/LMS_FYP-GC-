import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Class from '@/models/Class';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { className, program, semester, sections, subjects } = body;

    const newClass = await Class.create({
      className,
      program,
      semester,
      sections,
      subjects
    });

    return NextResponse.json({ success: true, class: newClass }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
