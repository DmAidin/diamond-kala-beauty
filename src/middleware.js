import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const adminPaths = ["/admin"];
const userPaths = ["/dashboard", "/checkout"];

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token) {
    if (adminPaths.some((p) => pathname.startsWith(p)) || userPaths.some((p) => pathname.startsWith(p))) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (adminPaths.some((path) => pathname.startsWith(path)) && token.role !== "admin") {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }

  if (
    userPaths.some((path) => pathname.startsWith(path)) &&
    token.role !== "user" &&
    token.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/checkout/:path*"],
};
