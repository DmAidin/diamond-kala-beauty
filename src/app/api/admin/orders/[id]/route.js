import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../../utils/database";
import Order from "../../../../../models/order";
import Product from "../../../../../models/product";

// PATCH { status?, trackingCode? }: admin updates order fulfilment status
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    const body = await request.json();
    const update = {};
    if (body.status) update.status = body.status;
    if (body.trackingCode !== undefined) update.trackingCode = body.trackingCode;

    await connectToDB();

    const existing = await Order.findById(params.id);
    if (!existing) return new Response(JSON.stringify({ error: "سفارش یافت نشد" }), { status: 404 });

    // stock is reserved the moment an order is *created* (see /api/orders)
    // and only ever released when it becomes "failed" or "cancelled" — so
    // every other status (pending included) is still holding real stock.
    // Cancelling it now (e.g. the admin is refunding the customer offline,
    // or cancelling a pending order directly) should release it back to
    // the catalog instead of leaving it stuck as "sold" forever.
    const hadReservedStock = existing.status !== "failed" && existing.status !== "cancelled";
    const isNewlyCancelled = update.status === "cancelled" && existing.status !== "cancelled";

    const order = await Order.findByIdAndUpdate(params.id, update, { new: true });

    if (isNewlyCancelled && hadReservedStock) {
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
        )
      );
    }

    return new Response(JSON.stringify(order), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return new Response(JSON.stringify({ error: "خطا در به‌روزرسانی سفارش" }), { status: 500 });
  }
}
