import { put } from "@vercel/blob";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// POST (multipart/form-data, field name "file"): uploads one image to
// Vercel Blob and returns its real, public, https URL — this replaces the
// old approach of turning images into base64 data URIs and storing that
// giant string directly in MongoDB. A data URI isn't a fetchable URL, so
// Google's structured data (Merchant listings) rejected it outright, and
// every product page was bloated by the inline image data.
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "فایلی ارسال نشده" }), { status: 400 });
    }

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "حجم فایل نباید بیشتر از ۸ مگابایت باشد" }), { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "فقط فایل تصویر مجاز است" }), { status: 400 });
    }

    // random-suffixed path avoids collisions between products with
    // identically-named source files (e.g. two admins both uploading "photo.jpg")
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return new Response(JSON.stringify({ error: "خطا در آپلود تصویر" }), { status: 500 });
  }
}
