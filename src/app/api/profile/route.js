import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../lib/prisma";

// PATCH { name }: update the current user's display name
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "لطفاً وارد شوید" }), { status: 401 });

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: "نام نمی‌تواند خالی باشد" }), { status: 400 });
    }
    const user = await prisma.user.update({ where: { id: session.user.id }, data: { name: name.trim() } });
    return new Response(JSON.stringify({ name: user.name }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در به‌روزرسانی پروفایل" }), { status: 500 });
  }
}
