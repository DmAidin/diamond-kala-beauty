import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Message from "../../../models/message";

// POST: anyone can send a contact message
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, text } = body;

    if (!name?.trim() || !email?.trim() || !text?.trim()) {
      return new Response(JSON.stringify({ error: "نام، ایمیل و متن پیام الزامی است" }), { status: 400 });
    }

    await connectToDB();
    await Message.create({ name, email, phone, text });

    return new Response(JSON.stringify({ message: "پیام شما با موفقیت ارسال شد" }), { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return new Response(JSON.stringify({ error: "خطا در ارسال پیام" }), { status: 500 });
  }
}

// GET: admin-only, list messages
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    await connectToDB();
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در دریافت پیام‌ها" }), { status: 500 });
  }
}
