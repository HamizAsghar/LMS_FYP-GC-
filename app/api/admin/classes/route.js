import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Class from '@/models/Class';

export async function GET() {
  try {
    await dbConnect();
    const classes = await Class.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, classes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
