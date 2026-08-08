import { connectToDB } from "../utils/database";
import Product from "../models/product";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://diamond-kala-store.vercel.app";

  const staticRoutes = ["", "/about", "/contact", "/policies/privacy", "/policies/terms", "/policies/returns"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
    })
  );

  let productRoutes = [];
  try {
    await connectToDB();
    const products = await Product.find({}, "_id updatedAt").lean();
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/product/${p._id}`,
      lastModified: p.updatedAt,
    }));
  } catch (error) {
    // if the DB is unreachable at build time, still ship the static routes
  }

  return [...staticRoutes, ...productRoutes];
}
