import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Order from "../../../models/order";
import Coupon from "../../../models/coupon";
import Product from "../../../models/product";
import Counter from "../../../models/counter";
import { rateLimit } from "../../../utils/rateLimit";
import { tehranDateStamp } from "../../../utils/dateUtils";

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
  const stamp = tehranDateStamp(); // "YYMMDD" in Tehran time, not server UTC
  const dayKey = `order-${stamp}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: dayKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `DK-${stamp}-${String(counter.seq).padStart(4, "0")}`;
}

// courier delivery is now collect-on-delivery — the courier collects the
// shipping fee from the recipient in person, so it's never added to the
// online payment total (only kept as metadata for the admin/receipt).
const COURIER_FEE = 0;

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

    // Atomically RESERVE stock for every item — this is a real deduction at
    // order-creation time, not just a read-then-check. A plain read-then-check
    // lets two customers both "pass" the check for the same last unit before
    // either one's order finishes, overselling it. findOneAndUpdate with a
    // `stock: { $gte: quantity }` filter is atomic at the database level, so
    // only one of two simultaneous requests can ever win the last unit.
    // If any item in the cart fails to reserve, every item already reserved
    // in this same request is rolled back before returning the error.
    const reserved = [];
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        await Promise.all(
          reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.quantity } }))
        );
        return new Response(
          JSON.stringify({ error: `موجودی «${item.title}» کافی نیست` }),
          { status: 400 }
        );
      }
      reserved.push(item);
    }

    // stock is now reserved — if anything below fails, release it before
    // returning an error, so a coupon/DB hiccup never leaves inventory stuck
    try {
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
    } catch (innerError) {
      await Promise.all(
        reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.quantity } }))
      );
      throw innerError;
    }
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return new Response(JSON.stringify({ error: "خطا در ثبت سفارش" }), { status: 500 });
  }
}
