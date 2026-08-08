import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, adminKey } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "همه فیلدها الزامی‌اند" }),
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

    // بررسی کلید ادمین از env
    const isAdmin =
      adminKey && adminKey === process.env.ADMIN_SECRET ? true : false;

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? "admin" : "user",
      },
    });

    return new Response(
      JSON.stringify({
        message: isAdmin
          ? "ثبت‌نام ادمین با موفقیت انجام شد"
          : "ثبت‌نام با موفقیت انجام شد",
      }),
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
