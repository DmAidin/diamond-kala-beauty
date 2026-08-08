import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Order from "../../../models/order";
import Coupon from "../../../models/coupon";

// GET: list the current user's own orders
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "لطفاً ابتدا وارد شوید" }), { status: 401 });
  }

  try {
    await connectToDB();
    const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return new Response(JSON.stringify({ error: "خطا در دریافت سفارش‌ها" }), { status: 500 });
  }
}

// POST: create a new pending order from the client-side cart.
// Coupon is re-validated here server-side so a tampered client can't grant itself a discount.
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "لطفاً ابتدا وارد شوید" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, receiver, couponCode } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "سبد خرید خالی است" }), { status: 400 });
    }
    if (!receiver?.fullName?.trim() || !receiver?.phone?.trim() || !receiver?.address?.trim()) {
      return new Response(JSON.stringify({ error: "اطلاعات گیرنده کامل نیست" }), { status: 400 });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let appliedCode = "";

    await connectToDB();

    if (couponCode?.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      const valid =
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) &&
        subtotal >= coupon.minOrderTotal;
      if (valid) {
        discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
        appliedCode = coupon.code;
      }
    }

    const totalPrice = Math.max(subtotal - discount, 0);

    const order = await Order.create({
      userId: session.user.id,
      items: items.map((i) => ({
        productId: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      discount,
      totalPrice,
      couponCode: appliedCode,
      receiver,
      status: "pending",
    });

    return new Response(JSON.stringify(order), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return new Response(JSON.stringify({ error: "خطا در ثبت سفارش" }), { status: 500 });
  }
}
