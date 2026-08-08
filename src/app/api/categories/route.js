import { connectToDB } from "../../../utils/database";
import Product from "../../../models/product";

// GET: distinct categories and brands currently in use — powers navbar
// links and storefront filters without hardcoding a fixed product list.
export async function GET() {
  try {
    await connectToDB();
    const [categories, brands] = await Promise.all([
      Product.distinct("category"),
      Product.distinct("brand"),
    ]);
    return new Response(
      JSON.stringify({
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ categories: [], brands: [] }), { status: 200 });
  }
}
