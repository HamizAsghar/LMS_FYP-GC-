import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const roleMap = { student: "Student", instructor: "Instructor", admin: "Admin" };
    const expectedRole = roleMap[role?.toLowerCase()] || role;

    if (expectedRole && user.role !== expectedRole) {
      return NextResponse.json(
        { success: false, message: `This account is registered as ${user.role}` },
        { status: 403 }
      );
    }

    if (user.role === "Instructor") {
      if (user.approvalStatus === "Pending") {
        return NextResponse.json(
          { success: false, message: "Your instructor account is pending admin approval." },
          { status: 403 }
        );
      }
      if (user.approvalStatus === "Rejected") {
        return NextResponse.json(
          { success: false, message: "Your instructor registration was rejected. Contact admin." },
          { status: 403 }
        );
      }
    }

    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, message: "Your account is inactive. Contact admin." },
        { status: 403 }
      );
    }

    if (!user.isVerified && user.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Please verify your email to login" },
        { status: 401 }
      );
    }

    const token = user.getSignedJwtToken();

    await logActivity({
      userId: user._id,
      role: user.role,
      action: "Login",
      target: "Authentication",
    });

    const safeUser = await User.findById(user._id).select("-password").lean();

    return NextResponse.json(
      { success: true, token, user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
