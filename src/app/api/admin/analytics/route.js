import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import PageView from "../../../../models/pageView";

// GET: today's visit count plus the last 7 days, admin-only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  await connectToDB();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }

  const records = await PageView.find({ date: { $in: days } });
  const map = Object.fromEntries(records.map((r) => [r.date, r.count]));
  const series = days.map((date) => ({ date, count: map[date] || 0 }));
  const today = series[series.length - 1].count;

  return new Response(JSON.stringify({ today, series }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
