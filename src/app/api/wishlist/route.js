import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Wishlist from "../../../models/wishlist";
import Product from "../../../models/product";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session.user;
}

// GET: the current user's wishlist, resolved to full product documents
export async function GET() {
  const user = await requireUser();
  if (!user) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  try {
    await connectToDB();
    const wishlist = await Wishlist.findOne({ userId: user.id });
    const ids = wishlist?.productIds || [];
    const products = ids.length ? await Product.find({ _id: { $in: ids } }) : [];

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در دریافت علاقه‌مندی‌ها" }), { status: 500 });
  }
}

// POST { productId }: toggle a product in/out of the wishlist
export async function POST(request) {
  const user = await requireUser();
  if (!user) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  try {
    const { productId } = await request.json();
    await connectToDB();

    let wishlist = await Wishlist.findOne({ userId: user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: user.id, productIds: [productId] });
      return new Response(JSON.stringify({ added: true }), { status: 200 });
    }

    const has = wishlist.productIds.includes(productId);
    if (has) {
      wishlist.productIds = wishlist.productIds.filter((id) => id !== productId);
    } else {
      wishlist.productIds.push(productId);
    }
    await wishlist.save();

    return new Response(JSON.stringify({ added: !has }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return new Response(JSON.stringify({ error: "خطا در به‌روزرسانی علاقه‌مندی‌ها" }), { status: 500 });
  }
}
