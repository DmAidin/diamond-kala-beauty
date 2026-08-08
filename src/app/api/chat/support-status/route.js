import { connectToDB } from "../../../../utils/database";
import AdminPresence from "../../../../models/adminPresence";

// GET: is any admin currently online (heartbeat within the last 60s)?
export async function GET() {
  try {
    await connectToDB();
    const cutoff = new Date(Date.now() - 60 * 1000);
    const online = await AdminPresence.exists({ lastSeen: { $gte: cutoff } });
    return new Response(JSON.stringify({ online: !!online }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ online: false }), { status: 200 });
  }
}
