export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import bcrypt from 'bcryptjs';

async function updatePasswordHandler(req: NextRequest, user: any) {
  try {
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashed }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Password Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}

export const POST = withAuth(updatePasswordHandler);
