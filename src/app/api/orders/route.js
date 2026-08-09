import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Order from "../../../models/order";
import Coupon from "../../../models/coupon";
import Product from "../../../models/product";
import Counter from "../../../models/counter";
import { rateLimit } from "../../../utils/rateLimit";

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

// Atomically claims the next order number for today, e.g. DK-260808-0007.
async function nextOrderNumber() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dayKey = `order-${y}${m}${d}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: dayKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `DK-${y}${m}${d}-${String(counter.seq).padStart(4, "0")}`;
}

// courier delivery flat fee, in Toman — enforced server-side so a client
// can never submit a discounted or missing shipping charge
const COURIER_FEE = 200000;

// POST: create a new pending order from the client-side cart.
// Coupon is re-validated here server-side so a tampered client can't grant itself a discount.
// Stock is checked (not yet deducted — that happens once payment is verified).
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "لطفاً ابتدا وارد شوید" }), { status: 401 });
  }

  const limited = await rateLimit(`create-order:${session.user.id}`, { limit: 10, windowSeconds: 600 });
  if (!limited.ok) {
    return new Response(JSON.stringify({ error: "تعداد سفارش‌های ثبت‌شده زیاد بوده، کمی صبر کنید" }), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    const body = await request.json();
    const { items, receiver, couponCode, deliveryMethod } = body;
    const method = deliveryMethod === "pickup" ? "pickup" : "courier";

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "سبد خرید خالی است" }), { status: 400 });
    }
    if (!receiver?.fullName?.trim() || !receiver?.phone?.trim() || !receiver?.address?.trim()) {
      return new Response(JSON.stringify({ error: "اطلاعات گیرنده کامل نیست" }), { status: 400 });
    }

    await connectToDB();

    // confirm every item is still in stock before creating the order
    const products = await Product.find({ _id: { $in: items.map((i) => i.id) } });
    for (const item of items) {
      const product = products.find((p) => String(p._id) === item.id);
      if (!product || product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `موجودی «${item.title}» کافی نیست` }),
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = method === "courier" ? COURIER_FEE : 0;
    let discount = 0;
    let appliedCode = "";

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

    const totalPrice = Math.max(subtotal - discount, 0) + shippingCost;
    const orderNumber = await nextOrderNumber();

    const order = await Order.create({
      userId: session.user.id,
      orderNumber,
      items: items.map((i) => ({
        productId: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      discount,
      deliveryMethod: method,
      shippingCost,
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
