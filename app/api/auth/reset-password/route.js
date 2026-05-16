import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  await dbConnect();

  try {
    const { token, password } = await req.json();

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
