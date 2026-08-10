import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";
import { requestPayment } from "../../../../utils/zarinpal";

// POST { orderId }: asks ZarinPal for a payment link for an existing pending order
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "لطفاً ابتدا وارد شوید" }), { status: 401 });
  }

  try {
    const { orderId } = await request.json();
    await connectToDB();

    const order = await Order.findOne({ _id: orderId, userId: session.user.id });
    if (!order) {
      return new Response(JSON.stringify({ error: "سفارش یافت نشد" }), { status: 404 });
    }
    if (order.status === "paid") {
      return new Response(JSON.stringify({ error: "این سفارش قبلاً پرداخت شده است" }), { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const callbackUrl = `${baseUrl}/api/payment/verify?orderId=${order._id}`;

    const result = await requestPayment({
      amountToman: order.totalPrice,
      description: `پرداخت سفارش دایمند کالا #${order._id}`,
      callbackUrl,
      email: session.user.email,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), { status: 502 });
    }

    order.payment.authority = result.authority;
    await order.save();

    return new Response(JSON.stringify({ gatewayUrl: result.gatewayUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/payment/request error:", error);
    return new Response(JSON.stringify({ error: "خطا در اتصال به درگاه پرداخت" }), { status: 500 });
  }
}
