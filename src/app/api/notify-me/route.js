import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import NotifyRequest from "../../../models/notifyRequest";
import { rateLimit } from "../../../utils/rateLimit";

// POST: register interest in a currently out-of-stock product.
// Body: { productId, email }
export async function POST(request) {
  try {
    const { productId, email } = await request.json();
    if (!productId || !email?.trim()) {
      return new Response(JSON.stringify({ error: "ایمیل و شناسه محصول الزامی است" }), { status: 400 });
    }

    const limited = await rateLimit(`notify-me:${email.trim().toLowerCase()}`, { limit: 10, windowSeconds: 3600 });
    if (!limited.ok) {
      return new Response(JSON.stringify({ error: "درخواست‌های زیادی ثبت شده، کمی صبر کنید" }), {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      });
    }

    await connectToDB();
    const session = await getServerSession(authOptions);

    const normalizedEmail = email.trim().toLowerCase();

    // don't let the same person queue duplicate un-notified requests for
    // the same product
    const existing = await NotifyRequest.findOne({
      productId,
      email: normalizedEmail,
      notifiedAt: null,
    });
    if (existing) {
      return new Response(JSON.stringify({ ok: true, alreadyRequested: true }), { status: 200 });
    }

    await NotifyRequest.create({
      productId,
      email: normalizedEmail,
      userId: session?.user?.id || null,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  } catch (error) {
    console.error("POST /api/notify-me error:", error);
    return new Response(JSON.stringify({ error: "خطا در ثبت درخواست" }), { status: 500 });
  }
}

// GET: for the admin panel — how many people are waiting on each product.
// ?productId=... narrows to a single product's count.
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const count = await NotifyRequest.countDocuments({ productId, notifiedAt: null });
      return new Response(JSON.stringify({ count }), { status: 200 });
    }

    const counts = await NotifyRequest.aggregate([
      { $match: { notifiedAt: null } },
      { $group: { _id: "$productId", count: { $sum: 1 } } },
    ]);
    return new Response(JSON.stringify(counts), { status: 200 });
  } catch (error) {
    console.error("GET /api/notify-me error:", error);
    return new Response(JSON.stringify({ error: "خطا در دریافت اطلاعات" }), { status: 500 });
  }
}
