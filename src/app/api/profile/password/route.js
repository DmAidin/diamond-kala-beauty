import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { compare, hash } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { rateLimit } from "../../../../utils/rateLimit";

// PATCH { currentPassword, newPassword }: change the logged-in user's own
// password — requires the current password, never lets anyone skip that
// check even though they're already authenticated (protects against a
// hijacked/left-open session on a shared device).
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  const limited = await rateLimit(`change-password:${session.user.id}`, { limit: 6, windowSeconds: 600 });
  if (!limited.ok) {
    return new Response(JSON.stringify({ error: "تعداد تلاش‌ها زیاد بوده، کمی بعد دوباره امتحان کنید" }), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "همه فیلدها الزامی‌اند" }), { status: 400 });
    }
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return new Response(JSON.stringify({ error: "کاربر یافت نشد" }), { status: 404 });

    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "رمز عبور فعلی نادرست است" }), { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    return new Response(JSON.stringify({ message: "رمز عبور با موفقیت تغییر کرد" }), { status: 200 });
  } catch (error) {
    console.error("PATCH /api/profile/password error:", error);
    return new Response(JSON.stringify({ error: "خطا در تغییر رمز عبور" }), { status: 500 });
  }
}
