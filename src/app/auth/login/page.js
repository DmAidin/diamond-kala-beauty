"use client";

import { signIn } from "next-auth/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/redirect-after-login";
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("ایمیل نامعتبر است").required("ایمیل الزامی است"),
      password: Yup.string().required("رمز عبور الزامی است"),
    }),
    onSubmit: async (values) => {
      setError(null);
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (res?.ok) {
        router.push(res.url || callbackUrl);
      } else {
        setError("ورود ناموفق بود. لطفاً ایمیل و رمز عبور را بررسی کنید.");
      }
    },
  });

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-base-panel border border-base-line rounded-sm p-8 sm:p-10">
        <h2 className="font-display text-2xl text-ink text-center mb-8">ورود به حساب کاربری</h2>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-sm border border-signal-bad/40 bg-signal-bad/10 text-signal-bad text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm text-ink-muted">ایمیل</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`w-full px-4 py-3 rounded-sm bg-base border text-ink focus:outline-none transition-colors ${
                formik.touched.email && formik.errors.email ? "border-signal-bad" : "border-base-line focus:border-gold"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-signal-bad text-xs">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm text-ink-muted">رمز عبور</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full px-4 py-3 rounded-sm bg-base border text-ink focus:outline-none transition-colors ${
                formik.touched.password && formik.errors.password ? "border-signal-bad" : "border-base-line focus:border-gold"
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-signal-bad text-xs">{formik.errors.password}</p>
            )}
            <div className="text-left mt-2">
              <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">
                رمز عبور را فراموش کرده‌اید؟
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors"
          >
            ورود
          </button>
        </form>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-3 mt-4 rounded-sm border border-base-line text-ink hover:border-gold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 488 512" fill="currentColor">
            <path d="M488 261.8c0-17.8-1.6-35-4.7-51.6H249v97.8h135.9c-5.9 31.8-23.4 58.6-49.7 76.6v63.5h80.6c47.2-43.5 74.2-107.6 74.2-186.3z" />
            <path d="M249 508c66.4 0 122-22 162.7-59.8l-80.6-63.5c-22.3 14.8-51 23.5-82.1 23.5-63 0-116.5-42.5-135.6-99.8H30.3v62.7C70.7 457.6 152.5 508 249 508z" />
            <path d="M113.4 308.4c-4.8-14.2-7.6-29.4-7.6-45s2.7-30.8 7.6-45V155.6H30.3C11.3 192.2 0 234.3 0 269.4s11.3 77.2 30.3 113.8l83.1-64.8z" />
            <path d="M249 104.1c36 0 68.2 12.4 93.6 36.7l70.3-70.3C368.9 27.5 314.3 0 249 0 152.5 0 70.7 50.4 30.3 155.6l83.1 64.8c19.1-57.3 72.6-99.8 135.6-99.8z" />
          </svg>
          ورود با گوگل
        </button>

        <p className="text-center text-sm text-ink-muted mt-6">
          حساب کاربری ندارید؟{" "}
          <Link href="/auth/register" className="text-gold hover:underline">ثبت‌نام کنید</Link>
        </p>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
