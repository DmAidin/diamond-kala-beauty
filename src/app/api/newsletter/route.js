import { connectToDB } from "../../../utils/database";
import Newsletter from "../../../models/newsletter";

// POST { email }: subscribe to the newsletter (idempotent — re-subscribing is a no-op success)
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return new Response(JSON.stringify({ error: "ایمیل را وارد کنید" }), { status: 400 });
    }
    await connectToDB();
    await Newsletter.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
      { upsert: true }
    );
    return new Response(JSON.stringify({ message: "عضویت با موفقیت انجام شد" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در ثبت عضویت" }), { status: 500 });
  }
}
