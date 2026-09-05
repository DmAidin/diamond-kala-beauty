import { connectToDB } from "@/utils/database";
import Product from "@/models/product";
import Order from "@/models/order";
import { serializeProduct } from "@/utils/serialize";
import HomeClient from "./HomeClient";

// Server Component: fetches everything the storefront needs *before* the
// page reaches the browser, so the initial HTML Googlebot sees already
// contains every product card and its link — the client component below
// only adds interactivity (filtering, wishlist, add-to-cart) on top of it.
async function getHomeData({ category, q }) {
  try {
    await connectToDB();

    const query = {};
    if (category) query.category = category;
    if (q) query.name = { $regex: q, $options: "i" };

    const [productsRaw, categoriesRaw, brandsRaw, newestRaw] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).lean(),
      Product.distinct("category"),
      Product.distinct("brand"),
      Product.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    let bestsellersRaw = [];
    try {
      const ranked = await Order.aggregate([
        { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" } } },
        { $sort: { qty: -1 } },
        { $limit: 10 },
      ]);
      const ids = ranked.map((r) => r._id);
      const found = await Product.find({ _id: { $in: ids } }).lean();
      bestsellersRaw = ids.map((id) => found.find((p) => String(p._id) === id)).filter(Boolean);
    } catch {
      // sales ranking is a nice-to-have; an empty carousel is fine if it fails
    }

    return {
      products: productsRaw.map(serializeProduct),
      categories: categoriesRaw.filter(Boolean).sort(),
      brands: brandsRaw.filter(Boolean).sort(),
      newest: newestRaw.map(serializeProduct),
      bestsellers: bestsellersRaw.map(serializeProduct),
    };
  } catch (error) {
    return { products: [], categories: [], brands: [], newest: [], bestsellers: [] };
  }
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || null;
  const q = sp?.q || "";

  const data = await getHomeData({ category, q });

  return <HomeClient data={data} initialCategory={category} initialSearch={q} />;
}
