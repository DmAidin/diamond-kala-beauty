import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import prisma from "../../../../../lib/prisma";

// PATCH { role }: promote/demote a user. Admins cannot demote themselves
// (guards against a lone admin locking themselves out of the panel).
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403 });
  }
  if (params.id === session.user.id) {
    return new Response(JSON.stringify({ error: "نمی‌توانید نقش خودتان را تغییر دهید" }), { status: 400 });
  }

  try {
    const { role } = await request.json();
    if (!["admin", "user"].includes(role)) {
      return new Response(JSON.stringify({ error: "نقش نامعتبر است" }), { status: 400 });
    }
    const user = await prisma.user.update({ where: { id: params.id }, data: { role } });
    return new Response(JSON.stringify({ id: user.id, role: user.role }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در تغییر نقش کاربر" }), { status: 500 });
  }
}
