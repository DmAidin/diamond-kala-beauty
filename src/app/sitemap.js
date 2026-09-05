import { connectToDB } from "../utils/database";
import Product from "../models/product";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://diamondkalashop.ir";

  // static pages change rarely — a fixed date avoids sending Google a new
  // "lastModified" on every single build, which erodes trust in the file
  const staticLastMod = new Date("2026-09-01");

  const staticRoutes = ["", "/about", "/contact", "/policies/privacy", "/policies/terms", "/policies/returns"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: staticLastMod,
    })
  );

  let productRoutes = [];
  let categoryRoutes = [];
  try {
    await connectToDB();
    const products = await Product.find({}, "_id updatedAt category").lean();

    productRoutes = products.map((p) => ({
      url: `${baseUrl}/product/${p._id}`,
      lastModified: p.updatedAt,
    }));

    // one entry per distinct category — these are the pages that actually
    // link out to every product, which is how Google discovers and
    // re-crawls them
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/category/${encodeURIComponent(c)}`,
      lastModified: staticLastMod,
    }));
  } catch (error) {
    // if the DB is unreachable at build time, still ship the static routes
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
