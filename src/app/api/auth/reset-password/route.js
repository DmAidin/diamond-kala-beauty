import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { connectToDB } from "../../../../utils/database";
import PasswordResetToken from "../../../../models/passwordResetToken";
import { rateLimit, getClientIp } from "../../../../utils/rateLimit";

// POST { token, password }: consumes a reset token and sets the new password
export async function POST(req) {
  const ip = getClientIp(req);
  const limited = await rateLimit(`reset-password:${ip}`, { limit: 10, windowSeconds: 600 });
  if (!limited.ok) {
    return new Response(JSON.stringify({ message: "تعداد تلاش‌ها زیاد بوده، بعداً دوباره امتحان کنید" }), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return new Response(JSON.stringify({ message: "اطلاعات ناقص است" }), { status: 400 });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }), { status: 400 });
    }

    await connectToDB();
    const record = await PasswordResetToken.findOne({ token });
    if (!record || record.expiresAt < new Date()) {
      return new Response(JSON.stringify({ message: "لینک بازیابی نامعتبر یا منقضی‌شده است" }), { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.update({ where: { email: record.email }, data: { password: hashedPassword } });
    await PasswordResetToken.deleteOne({ _id: record._id });

    return new Response(JSON.stringify({ message: "رمز عبور با موفقیت تغییر کرد" }), { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return new Response(JSON.stringify({ message: "خطا در تغییر رمز عبور" }), { status: 500 });
  }
}
