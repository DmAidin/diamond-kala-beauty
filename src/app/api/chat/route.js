import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import ChatMessage from "../../../models/chatMessage";

// GET: the current customer's own conversation with support
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  await connectToDB();
  const messages = await ChatMessage.find({ userId: session.user.id }).sort({ createdAt: 1 });
  // mark admin replies as seen by the customer now that they're fetching them
  await ChatMessage.updateMany({ userId: session.user.id, senderRole: "admin" }, { readByUser: true });

  return new Response(JSON.stringify(messages), { status: 200, headers: { "Content-Type": "application/json" } });
}

// POST { text }: customer sends a message to support
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  try {
    const { text } = await request.json();
    if (!text?.trim()) return new Response(JSON.stringify({ error: "متن پیام خالی است" }), { status: 400 });

    await connectToDB();
    const message = await ChatMessage.create({
      userId: session.user.id,
      senderRole: "user",
      senderName: session.user.name,
      text: text.trim(),
      readByUser: true,
    });

    return new Response(JSON.stringify(message), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در ارسال پیام" }), { status: 500 });
  }
}
