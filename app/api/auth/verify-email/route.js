import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  await dbConnect();

  try {
    const { token } = await req.json();

    const verificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: verificationToken,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification token" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
