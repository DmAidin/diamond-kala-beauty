import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { rateLimit, getClientIp } from "../../../../utils/rateLimit";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const limited = await rateLimit(`create-admin:${ip}`, { limit: 3, windowSeconds: 3600 });
    if (!limited.ok) {
      return new Response(JSON.stringify({ message: "تعداد تلاش‌های شما زیاد بوده، بعداً دوباره امتحان کنید" }), {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      });
    }

    const body = await req.json();
    const { name, email, password, secret } = body;

    if (!name || !email || !password || !secret) {
      return new Response(JSON.stringify({ message: "فیلدها کامل نیستند" }), {
        status: 400,
      });
    }

    if (secret !== process.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ message: "دسترسی غیرمجاز" }), {
        status: 401,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "ایمیل قبلاً ثبت شده" }), {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin", // حتما نقش ادمین ست بشه
      },
    });

    return new Response(JSON.stringify({ message: "ادمین با موفقیت ساخته شد" }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return new Response(JSON.stringify({ message: "خطا در ساخت ادمین" }), {
      status: 500,
    });
  }
}
