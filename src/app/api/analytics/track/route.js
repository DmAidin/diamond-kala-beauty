import { connectToDB } from "../../../../utils/database";
import PageView from "../../../../models/pageView";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// POST: called once per browser session (see VisitTracker) to count a visit
export async function POST() {
  try {
    await connectToDB();
    await PageView.findOneAndUpdate(
      { date: todayKey() },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    // analytics must never break the site for the visitor
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}
