import { put } from "@vercel/blob";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Product from "../../../../models/product";

// One-time cleanup: every product image that's still a base64 data URI
// (from before the upload form switched to real Vercel Blob storage) gets
// uploaded to Blob and swapped for its real URL. Safe to run more than
// once — anything already a real https URL is left untouched.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    await connectToDB();
    const products = await Product.find({});

    let migratedImages = 0;
    let migratedProducts = 0;
    const failures = [];

    for (const product of products) {
      let changed = false;
      const newImages = [];

      for (const src of product.images || []) {
        if (typeof src === "string" && src.startsWith("data:")) {
          try {
            const [header, base64] = src.split(",");
            const contentType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
            const buffer = Buffer.from(base64, "base64");
            const ext = contentType.split("/")[1] || "jpg";
            const path = `products/migrated-${product._id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

            const blob = await put(path, buffer, { access: "public", contentType, addRandomSuffix: false });
            newImages.push(blob.url);
            changed = true;
            migratedImages++;
          } catch (err) {
            failures.push({ productId: String(product._id), error: err.message });
            newImages.push(src); // keep the original rather than lose the image entirely
          }
        } else {
          newImages.push(src);
        }
      }

      if (changed) {
        product.images = newImages;
        await product.save();
        migratedProducts++;
      }
    }

    return new Response(JSON.stringify({ migratedProducts, migratedImages, failures }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/admin/migrate-images error:", error);
    return new Response(JSON.stringify({ error: "خطا در انتقال تصاویر" }), { status: 500 });
  }
}
