import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import ChatMessage from "../../../../models/chatMessage";
import prisma from "../../../lib/prisma";

// GET: one row per customer who has messaged support, with their last
// message and unread count — kept strictly separate per userId so admins
// never see conversations blended together.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  await connectToDB();
  const userIds = await ChatMessage.distinct("userId");

  const conversations = await Promise.all(
    userIds.map(async (userId) => {
      const [lastMessage, unreadCount, user] = await Promise.all([
        ChatMessage.findOne({ userId }).sort({ createdAt: -1 }),
        ChatMessage.countDocuments({ userId, senderRole: "user", readByAdmin: false }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      ]);
      return {
        userId,
        userName: user?.name || lastMessage?.senderName || "کاربر",
        userEmail: user?.email || "",
        lastMessage: lastMessage?.text || "",
        lastMessageAt: lastMessage?.createdAt,
        unreadCount,
      };
    })
  );

  conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  return new Response(JSON.stringify(conversations), { status: 200, headers: { "Content-Type": "application/json" } });
}
