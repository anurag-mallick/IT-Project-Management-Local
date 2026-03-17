export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  // Only admins can reset passwords
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0];
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    // Update password to default: Welcome@123
    // In a real app, we'd hash this. For now, following project style.
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: "Welcome@123", // Plain text or dummy hash per user instructions
      }
    });

    return NextResponse.json({ message: "Password reset to default (Welcome@123) successfully" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 });
  }
});
