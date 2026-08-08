import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Coupon from "../../../models/coupon";

// POST { code, subtotal }: validates a coupon and returns the discount it grants
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "لطفاً ابتدا وارد شوید" }), { status: 401 });
  }

  try {
    const { code, subtotal } = await request.json();
    if (!code?.trim()) {
      return new Response(JSON.stringify({ error: "کد تخفیف را وارد کنید" }), { status: 400 });
    }

    await connectToDB();
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon || !coupon.active) {
      return new Response(JSON.stringify({ error: "کد تخفیف نامعتبر است" }), { status: 404 });
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: "این کد تخفیف منقضی شده است" }), { status: 400 });
    }
    if (subtotal < coupon.minOrderTotal) {
      return new Response(
        JSON.stringify({ error: `حداقل مبلغ سفارش برای این کد ${coupon.minOrderTotal.toLocaleString()} تومان است` }),
        { status: 400 }
      );
    }

    const discount =
      coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;

    return new Response(JSON.stringify({ code: coupon.code, type: coupon.type, value: coupon.value, discount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return new Response(JSON.stringify({ error: "خطا در بررسی کد تخفیف" }), { status: 500 });
  }
}
