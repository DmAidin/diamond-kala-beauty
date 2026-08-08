import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../../utils/database";
import Coupon from "../../../../../models/coupon";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session.user;
}

export async function PATCH(request, { params }) {
  if (!(await requireAdmin())) {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }
  const body = await request.json();
  await connectToDB();
  const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true });
  return new Response(JSON.stringify(coupon), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }
  await connectToDB();
  await Coupon.findByIdAndDelete(params.id);
  return new Response(JSON.stringify({ deleted: true }), { status: 200 });
}
