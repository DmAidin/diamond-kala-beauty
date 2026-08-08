import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";

// GET: all orders in the store, admin-only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    await connectToDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return new Response(JSON.stringify({ error: "خطا در دریافت سفارش‌ها" }), { status: 500 });
  }
}
