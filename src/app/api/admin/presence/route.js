import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import AdminPresence from "../../../../models/adminPresence";

// POST: heartbeat — called periodically while an admin has the chat panel open
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  await connectToDB();
  await AdminPresence.findOneAndUpdate(
    { adminId: session.user.id },
    { adminId: session.user.id, lastSeen: new Date() },
    { upsert: true }
  );

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
