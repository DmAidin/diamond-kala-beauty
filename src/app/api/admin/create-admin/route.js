import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma";

export async function POST(req) {
  try {
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
