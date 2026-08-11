import crypto from "crypto";
import prisma from "../../../lib/prisma";
import { connectToDB } from "../../../../utils/database";
import PasswordResetToken from "../../../../models/passwordResetToken";
import { rateLimit, getClientIp } from "../../../../utils/rateLimit";
import { isValidEmail } from "../../../../utils/validate";
import { sendEmail } from "../../../../utils/email";

// POST { email }: always returns a generic success message — never
// reveals whether the email exists (same principle as the login route)
export async function POST(req) {
  const ip = getClientIp(req);
  const limited = await rateLimit(`forgot-password:${ip}`, { limit: 5, windowSeconds: 600 });
  if (!limited.ok) {
    return new Response(JSON.stringify({ message: "تعداد درخواست‌ها زیاد بوده، بعداً دوباره امتحان کنید" }), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  const genericMessage = "اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برایش ارسال شد.";

  try {
    const { email } = await req.json();
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ message: genericMessage }), { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await connectToDB();
      const token = crypto.randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        email,
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
      const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: "بازیابی رمز عبور | دایمند کالا",
        html: `
          <div dir="rtl" style="font-family: Tahoma, sans-serif; text-align: right;">
            <p>برای تنظیم رمز عبور جدید حساب کاربری‌تان در دایمند کالا، روی لینک زیر کلیک کنید:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>این لینک تا ۳۰ دقیقه دیگر معتبر است. اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.</p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ message: genericMessage }), { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return new Response(JSON.stringify({ message: genericMessage }), { status: 200 });
  }
}
