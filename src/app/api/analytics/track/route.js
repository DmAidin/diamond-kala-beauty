import { connectToDB } from "../../../../utils/database";
import PageView from "../../../../models/pageView";
import { tehranDateKey } from "../../../../utils/dateUtils";

// POST: called once per browser session (see VisitTracker) to count a visit
export async function POST() {
  try {
    await connectToDB();
    await PageView.findOneAndUpdate(
      { date: tehranDateKey() },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    // analytics must never break the site for the visitor
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}
