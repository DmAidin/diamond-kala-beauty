import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";

// GET: a single order, only visible to the customer who placed it
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  try {
    await connectToDB();
    const order = await Order.findOne({ _id: params.id, userId: session.user.id });
    if (!order) return new Response(JSON.stringify({ error: "سفارش یافت نشد" }), { status: 404 });

    return new Response(JSON.stringify(order), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در دریافت سفارش" }), { status: 500 });
  }
}
