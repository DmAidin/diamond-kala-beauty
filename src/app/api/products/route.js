import { connectToDB } from "../../../utils/database";
import Product from "../../../models/product";
import NotifyRequest from "../../../models/notifyRequest";
import { sendEmail } from "../../../utils/email";
import { serializeProduct } from "../../../utils/serialize";

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
    // .lean() + serializeProduct so the `specs` Map comes back as a plain
    // object — a Map silently serializes to "{}" through a bare
    // JSON.stringify(mongooseDocument), which would make previously-saved
    // specs disappear the moment an admin reopens a product to edit it
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return new Response(JSON.stringify(products.map(serializeProduct)), {
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

// When a product goes from "out of stock" to "back in stock", email
// everyone who asked to be notified, then mark those requests as done so
// nobody gets emailed twice for the same restock.
async function notifyWaitingCustomers(product) {
  const waiting = await NotifyRequest.find({ productId: product._id, notifiedAt: null });
  if (waiting.length === 0) return;

  const image = product.images?.[0] || product.image;
  for (const req of waiting) {
    await sendEmail({
      to: req.email,
      subject: `«${product.name}» دوباره موجود شد | دایمند کالا`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, sans-serif; text-align: right;">
          ${image ? `<img src="${image}" alt="${product.name}" style="max-width:200px;" />` : ""}
          <p>محصولی که منتظرش بودید، دوباره موجود شد:</p>
          <p style="font-weight:bold;">${product.name}</p>
          <p>برای مشاهده و خرید به فروشگاه دایمند کالا مراجعه کنید.</p>
        </div>
      `,
    });
  }

  await NotifyRequest.updateMany(
    { _id: { $in: waiting.map((r) => r._id) } },
    { $set: { notifiedAt: new Date() } }
  );
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

    const previous = await Product.findById(id, "stock");
    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updatedProduct) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (previous && previous.stock <= 0 && updatedProduct.stock > 0) {
      try {
        await notifyWaitingCustomers(updatedProduct);
      } catch (notifyError) {
        // a failed notification email should never fail the product save itself
        console.error("restock notification error:", notifyError);
      }
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
