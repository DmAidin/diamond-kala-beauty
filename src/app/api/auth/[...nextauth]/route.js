// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { rateLimit } from "../../../../utils/rateLimit";

const authOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip =
          req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
          req?.headers?.["x-real-ip"] ||
          "unknown";

        const limited = await rateLimit(`login:${ip}`, { limit: 8, windowSeconds: 300 });
        if (!limited.ok) {
          throw new Error("تعداد تلاش‌های ورود شما زیاد بوده، چند دقیقه بعد دوباره امتحان کنید");
        }

        // one generic error for both cases — never reveal whether the
        // email exists in the system
        const genericError = "ایمیل یا رمز عبور نادرست است";

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error(genericError);

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error(genericError);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // صفحه لاگین اختصاصی
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      // برای Google Login
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;

        // نقش کاربر رو بررسی یا مقدار پیش‌فرض "user" بده
        if (user.role) {
          token.role = user.role;
        } else {
          // اگر از گوگل اومده و در دیتابیس نیست، یه کاربر جدید بساز
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            token.role = existingUser.role;
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: "user",
              },
            });
            token.role = newUser.role;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };