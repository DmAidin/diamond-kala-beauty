import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RedirectAfterLogin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // اگر سشن نداشت، بره به صفحه لاگین
    redirect("/auth/login");
  }

  // هدایت بر اساس نقش کاربر
  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}
