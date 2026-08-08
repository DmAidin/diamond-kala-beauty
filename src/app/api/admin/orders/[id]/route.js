import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../../utils/database";
import Order from "../../../../../models/order";

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
    const order = await Order.findByIdAndUpdate(params.id, update, { new: true });
    if (!order) return new Response(JSON.stringify({ error: "سفارش یافت نشد" }), { status: 404 });

    return new Response(JSON.stringify(order), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return new Response(JSON.stringify({ error: "خطا در به‌روزرسانی سفارش" }), { status: 500 });
  }
}
