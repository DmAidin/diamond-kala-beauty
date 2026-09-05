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
  const title = `${product.name} | دایمند کالا`;
  const description = product.description?.slice(0, 160) || `خرید ${product.name} از فروشگاه دایمند کالا`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: "website",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery[0],
    brand: product.brand || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
