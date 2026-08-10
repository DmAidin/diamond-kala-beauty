import { connectToDB } from "../../../utils/database";
import Product from "../../../models/product";

// GET: دریافت همه محصولات (با فیلتر اختیاری category)
export async function GET(request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const query = {};
    if (category) query.category = category;
    if (q) query.name = { $regex: q, $options: "i" };
    const products = await Product.find(query).sort({ createdAt: -1 });
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST: اضافه کردن محصول جدید
export async function POST(request) {
  try {
    await connectToDB();
    const body = await request.json();

    if (!body.name || body.price === undefined || isNaN(body.price) || !Array.isArray(body.images) || body.images.length === 0) {
      return new Response(JSON.stringify({ error: "نام، قیمت و آدرس تصویر محصول الزامی است" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newProduct = new Product({
      ...body,
      price: Number(body.price),
    });

    await newProduct.save();

    return new Response(JSON.stringify(newProduct), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to create product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PUT: ویرایش محصول بر اساس id (از query parameter دریافت می‌شود)
export async function PUT(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    if (!body.name || body.price === undefined || isNaN(body.price) || !Array.isArray(body.images) || body.images.length === 0) {
      return new Response(JSON.stringify({ error: "نام، قیمت و آدرس تصویر محصول الزامی است" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updatedProduct) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to update product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE: حذف محصول بر اساس id (از query parameter دریافت می‌شود)
export async function DELETE(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Product deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
