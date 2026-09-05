import { connectToDB } from "@/utils/database";
import Product from "@/models/product";
import { serializeProduct } from "@/utils/serialize";
import CategoryClient from "./CategoryClient";

async function getCategoryProducts(category) {
  try {
    await connectToDB();
    const docs = await Product.find({ category }).sort({ createdAt: -1 }).lean();
    return docs.map(serializeProduct);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  return {
    title: `${category} | دایمند کالا`,
    description: `خرید آنلاین محصولات ${category} اورجینال از فروشگاه دایمند کالا با ارسال سریع و ضمانت اصالت کالا.`,
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  const products = await getCategoryProducts(category);

  return <CategoryClient category={category} products={products} />;
}
