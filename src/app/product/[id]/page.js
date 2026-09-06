import { notFound } from "next/navigation";
import { connectToDB } from "@/utils/database";
import Product from "@/models/product";
import Review from "@/models/review";
import { serializeProduct, serializeReview } from "@/utils/serialize";
import ProductDetailClient from "./ProductDetailClient";

async function getProductData(id) {
  await connectToDB();

  let productDoc;
  try {
    productDoc = await Product.findById(id).lean();
  } catch {
    // an invalid ObjectId format throws — treat exactly like "not found"
    return null;
  }
  if (!productDoc) return null;

  const product = serializeProduct(productDoc);

  const [relatedDocs, reviewDocs] = await Promise.all([
    Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4).lean(),
    Review.find({ productId: product._id }).sort({ createdAt: -1 }).lean(),
  ]);

  const related = relatedDocs.map(serializeProduct);
  const reviews = reviewDocs.map(serializeReview);
  const average = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return { product, related, reviews, average, reviewCount: reviews.length };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getProductData(id);
  if (!data) return { title: "محصول یافت نشد | دایمند کالا" };

  const { product } = data;
  const image = product.images?.[0] || product.image;
  const validImage = image?.startsWith("http") ? image : undefined;
  const title = `${product.name} | دایمند کالا`;
  const description = product.description?.slice(0, 160) || `خرید ${product.name} از فروشگاه دایمند کالا`;
  const inStock = (product.stock ?? 0) > 0;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: validImage ? [validImage] : [],
      type: "website",
    },
    // Required by price-comparison crawlers (e.g. Torob) that read only the
    // no-JS HTML and look for these exact tag names — separate from, and in
    // addition to, the standard SEO tags above.
    other: {
      product_id: product._id,
      product_name: product.name,
      product_price: String(product.price),
      availability: inStock ? "instock" : "outofstock",
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) notFound();

  const { product, related, reviews, average, reviewCount } = data;
  const inStock = (product.stock ?? 0) > 0;
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  // Google's structured data validator rejects anything that isn't a real,
  // fetchable http(s) URL (a base64 data URI, for instance) — this is a
  // defensive guard in case an unmigrated image ever reaches this page
  const validImage = gallery[0]?.startsWith("http") ? gallery[0] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: validImage,
    brand: product.brand || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      // reflects the real policy at src/app/policies/returns/page.js:
      // 72 hours, only for a defect or mismatch with the order — not a
      // no-questions-asked return window, so it isn't overstated here
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        applicableCountry: "IR",
      },
      // reflects the real checkout options: pickup is free, courier
      // delivery is collect-on-delivery (paid to the courier in person,
      // never charged through the online payment), see checkout/page.js
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "IRR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IR" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 4, unitCode: "DAY" },
        },
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: average.toFixed(1),
        reviewCount,
      },
    }),
  };

  return (
    <>
      {/* rendered server-side so crawlers see it immediately, without
          waiting on any client-side JavaScript */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient
        product={product}
        related={related}
        initialReviews={reviews}
        initialAverage={average}
        initialReviewCount={reviewCount}
      />
    </>
  );
}
