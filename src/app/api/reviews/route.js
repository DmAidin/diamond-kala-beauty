import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../utils/database";
import Review from "../../../models/review";

// GET ?productId=...  -> list reviews + average rating for a product
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return new Response(JSON.stringify({ error: "شناسه محصول لازم است" }), { status: 400 });
  }

  try {
    await connectToDB();
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    const average =
      reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    return new Response(JSON.stringify({ reviews, average, count: reviews.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در دریافت نظرات" }), { status: 500 });
  }
}

// POST { productId, rating, text }: one review per user per product
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "برای ثبت نظر ابتدا وارد شوید" }), { status: 401 });
  }

  try {
    const { productId, rating, text } = await request.json();
    if (!productId || !rating) {
      return new Response(JSON.stringify({ error: "امتیاز و محصول الزامی است" }), { status: 400 });
    }

    await connectToDB();
    const review = await Review.findOneAndUpdate(
      { productId, userId: session.user.id },
      { productId, userId: session.user.id, userName: session.user.name, rating, text },
      { upsert: true, new: true }
    );

    return new Response(JSON.stringify(review), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return new Response(JSON.stringify({ error: "خطا در ثبت نظر" }), { status: 500 });
  }
}
