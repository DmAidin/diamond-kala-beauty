import { connectToDB } from "../../../../utils/database";
import Product from "../../../../models/product";

export async function GET(req, { params }) {
  const { id } = params;
  try {
    await connectToDB();
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "محصول یافت نشد" }), { status: 404 });
    }
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در دریافت محصول" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const id = params.id;

  try {
    await connectToDB();
    await Product.findByIdAndDelete(id);
    return new Response("Deleted successfully", { status: 200 });
  } catch (error) {
    return new Response("Failed to delete product", { status: 500 });
  }
}
