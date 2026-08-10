import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";
import Product from "../../../../models/product";

// GET: best-selling products ranked by units sold across completed orders
export async function GET() {
  try {
    await connectToDB();
    const ranked = await Order.aggregate([
      { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]);

    const ids = ranked.map((r) => r._id);
    const products = await Product.find({ _id: { $in: ids } });
    // preserve the sales-ranked order
    const ordered = ids.map((id) => products.find((p) => String(p._id) === id)).filter(Boolean);

    return new Response(JSON.stringify(ordered), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
