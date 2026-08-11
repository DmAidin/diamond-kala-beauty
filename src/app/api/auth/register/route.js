import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { rateLimit, getClientIp } from "../../../../utils/rateLimit";
import { isValidEmail } from "../../../../utils/validate";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const limited = await rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 600 });
    if (!limited.ok) {
      return new Response(
        JSON.stringify({ message: "تعداد تلاش‌های شما زیاد بوده، کمی بعد دوباره امتحان کنید" }),
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "همه فیلدها الزامی‌اند" }),
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ message: "ایمیل وارد‌شده معتبر نیست" }),
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "ایمیل قبلاً ثبت شده" }),
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // every public sign-up is a plain customer account now — admin
    // accounts are only created through the separate, secret-protected
    // /api/admin/create-admin endpoint, never via this public form
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return new Response(
      JSON.stringify({ message: "ثبت‌نام با موفقیت انجام شد" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in register route:", error);
    return new Response(
      JSON.stringify({ message: "خطا در ثبت‌نام" }),
      { status: 500 }
    );
  }
}
