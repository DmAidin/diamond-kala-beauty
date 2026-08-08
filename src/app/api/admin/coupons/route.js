import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Coupon from "../../../../models/coupon";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session.user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }
  await connectToDB();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  return new Response(JSON.stringify(coupons), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }
  try {
    const body = await request.json();
    await connectToDB();
    const coupon = await Coupon.create({
      code: body.code,
      type: body.type,
      value: Number(body.value),
      minOrderTotal: Number(body.minOrderTotal) || 0,
      expiresAt: body.expiresAt || null,
      active: true,
    });
    return new Response(JSON.stringify(coupon), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error.code === 11000 ? "این کد تخفیف قبلاً ثبت شده است" : "خطا در ساخت کد تخفیف";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
