"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", adminKey: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("نام الزامی است"),
      email: Yup.string().email("ایمیل نامعتبر").required("ایمیل الزامی است"),
      password: Yup.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").required("رمز عبور الزامی است"),
      adminKey: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        let message = "ثبت‌نام ناموفق بود";
        if (!res.ok) {
          try {
            const errorData = await res.json();
            message = errorData.message || message;
          } catch (_) {}
          throw new Error(message);
        }
        router.push("/auth/login");
      } catch (err) {
        setError(err.message);
      }
    },
  });

  const field = (name, label, type = "text") => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm text-ink-muted">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        className={`w-full px-4 py-3 rounded-sm bg-base border text-ink focus:outline-none transition-colors ${
          formik.touched[name] && formik.errors[name] ? "border-signal-bad" : "border-base-line focus:border-gold"
        }`}
      />
      {formik.touched[name] && formik.errors[name] && (
        <p className="mt-1 text-signal-bad text-xs">{formik.errors[name]}</p>
      )}
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-base-panel border border-base-line rounded-sm p-8 sm:p-10">
        <h2 className="font-display text-2xl text-ink text-center mb-8">ساخت حساب کاربری</h2>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-sm border border-signal-bad/40 bg-signal-bad/10 text-signal-bad text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          {field("name", "نام")}
          {field("email", "ایمیل", "email")}
          {field("password", "رمز عبور", "password")}
          {field("adminKey", "کلید ادمین (اختیاری)")}

          <button
            type="submit"
            className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors"
          >
            ثبت‌نام
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/auth/login" className="text-gold hover:underline">وارد شوید</Link>
        </p>
      </div>
    </main>
  );
}
