import { connectToDB } from "../utils/database";
import Product from "../models/product";

// Without this, Next.js treats sitemap.js as static: it runs the query
// once at build time and then serves that same frozen result on every
// request until the next deployment — so a product added through the
// admin panel (a database write, not a new deploy) would never show up
// here until someone happened to redeploy the code. Forcing dynamic
// rendering makes every request re-run the query against the live database.
export const dynamic = "force-dynamic";

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