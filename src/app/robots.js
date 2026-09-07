export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://diamondkalashop.ir";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api", "/checkout"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
