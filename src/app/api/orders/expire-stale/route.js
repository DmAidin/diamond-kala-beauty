import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";
import Product from "../../../../models/product";

// A customer who closes the tab at the payment gateway (instead of coming
// back through /api/payment/verify) leaves their order stuck at "pending"
// forever — and its stock stays reserved forever too, since nothing ever
// tells us the payment failed. This sweeps up orders that have sat in
// "pending" for too long, marks them "failed", and releases their stock.
//
// Meant to be called periodically (see vercel.json's cron entry), not by
// users — protected by a shared secret rather than a login session.
const STALE_AFTER_MINUTES = 30;

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    await connectToDB();

    const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60 * 1000);
    const staleOrders = await Order.find({ status: "pending", createdAt: { $lt: cutoff } });

    for (const order of staleOrders) {
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
        )
      );
      order.status = "failed";
      await order.save();
    }

    return new Response(JSON.stringify({ released: staleOrders.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/orders/expire-stale error:", error);
    return new Response(JSON.stringify({ error: "خطا در پاکسازی سفارش‌های رهاشده" }), { status: 500 });
  }
}
