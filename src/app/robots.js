export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://diamond-kala-store.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
