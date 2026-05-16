import dbConnect from "@/dbConnect";
import User from "@/models/User";
import Student from "@/models/Student";
import Instructor from "@/models/Instructor";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  try {
    const { name, email, password, role, department, confirmPassword } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const validRoles = ["Student", "Instructor"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role for signup" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const isStudent = role === "Student";

    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      department: department || "",
      isVerified: true, // Set to true for both to allow immediate access
      approvalStatus: "Approved", // Set to Approved for both to allow immediate access
      status: "Active", // Set to Active for both
    });

    if (role === "Student") {
      await Student.create({ userId: user._id, department: department || "" });
      return NextResponse.json({
        success: true,
        message: "Account created successfully. You can sign in now.",
        data: { role: user.role, approvalStatus: user.approvalStatus },
      }, { status: 201 });
    }

    await Instructor.create({ userId: user._id, department: department || "" });

    return NextResponse.json({
      success: true,
      message: "Instructor account created successfully. You can sign in now.",
      data: { role: user.role, approvalStatus: user.approvalStatus },
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
