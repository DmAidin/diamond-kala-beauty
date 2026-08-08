import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../../utils/database";
import ChatMessage from "../../../../../models/chatMessage";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session.user;
}

// GET: full thread with one specific customer, marks their messages as read
export async function GET(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });

  await connectToDB();
  const messages = await ChatMessage.find({ userId: params.userId }).sort({ createdAt: 1 });
  await ChatMessage.updateMany({ userId: params.userId, senderRole: "user" }, { readByAdmin: true });

  return new Response(JSON.stringify(messages), { status: 200, headers: { "Content-Type": "application/json" } });
}

// POST { text }: admin replies to this specific customer
export async function POST(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });

  try {
    const { text } = await request.json();
    if (!text?.trim()) return new Response(JSON.stringify({ error: "متن پیام خالی است" }), { status: 400 });

    await connectToDB();
    const message = await ChatMessage.create({
      userId: params.userId,
      senderRole: "admin",
      senderName: admin.name,
      text: text.trim(),
      readByAdmin: true,
    });

    return new Response(JSON.stringify(message), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در ارسال پاسخ" }), { status: 500 });
  }
}
