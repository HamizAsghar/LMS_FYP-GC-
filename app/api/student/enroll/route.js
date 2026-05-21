import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import AssignedClass from '@/models/AssignedClass';
import { studentAuthMiddleware } from '@/middleware/student';

export async function POST(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
    }

    const studentId = authResult.user.id;
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
    }

    await dbConnect();

    // Find the AssignedClass with matching credentials
    const assignedClass = await AssignedClass.findOne({
      "credentials.username": username,
      "credentials.password": password
    });

    if (!assignedClass) {
      return NextResponse.json({ success: false, message: "Invalid class credentials" }, { status: 404 });
    }

    // Check if student is already enrolled
    if (assignedClass.enrolledStudents.includes(studentId)) {
      return NextResponse.json({ success: false, message: "You are already enrolled in this class" }, { status: 400 });
    }

    // Enroll the student in the AssignedClass
    assignedClass.enrolledStudents.push(studentId);
    await assignedClass.save();

    // Also record enrollment in the Student profile
    const Student = (await import('@/models/Student')).default;
    await Student.findOneAndUpdate(
      { userId: studentId },
      { $addToSet: { courses: assignedClass._id } },
      { new: true, upsert: true }
    );

    // Notify the instructor who teaches this AssignedClass
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.create({
        user: assignedClass.teacherId,
        type: 'system',
        title: 'New Student Joined Class',
        message: `${authResult.user.name || 'A student'} joined your class "${assignedClass.subject}".`,
        timestamp: new Date(),
        read: false
      });
    } catch (notifErr) {
      console.error('Failed to create class enrollment notification:', notifErr);
    }

    return NextResponse.json({ success: true, message: "Successfully enrolled in class", assignedClass }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
