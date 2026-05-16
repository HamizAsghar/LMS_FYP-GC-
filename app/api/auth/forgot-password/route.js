import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import sendEmail from "@/utils/sendEmail";

export async function POST(req) {
  await dbConnect();

  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "There is no user with that email" }, { status: 404 });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.headers.get("origin")}/reset-password?token=${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      return NextResponse.json({ success: true, message: "Email sent" }, { status: 200 });
    } catch (error) {
      console.error(error);
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return NextResponse.json({ success: false, message: "Email could not be sent" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
