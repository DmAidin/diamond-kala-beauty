// Seeds the store with sample beauty & personal-care products.
// Usage: npm run seed   (reads DATABASE_URL from .env.local)
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    images: [String],
    description: String,
    category: String,
    brand: String,
    stock: Number,
    specs: { type: Map, of: String },
  },
  { timestamps: true }
);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const products = [
  {
    name: "سرم ویتامین C روشن‌کننده پوست",
    price: 890000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Serum"],
    category: "مراقبت پوست",
    brand: "لومینا",
    stock: 22,
    description: "سرم تغلیظ‌شده‌ی ویتامین C برای روشن‌سازی و یکنواختی رنگ پوست، مناسب استفاده روزانه.",
    specs: { "حجم": "30ml", "نوع پوست": "همه انواع پوست", "زمان استفاده": "صبح" },
  },
  {
    name: "کرم مرطوب‌کننده هیالورونیک اسید",
    price: 650000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Cream"],
    category: "مراقبت پوست",
    brand: "هیدرا لوکس",
    stock: 30,
    description: "کرم مرطوب‌کننده‌ی سبک با هیالورونیک اسید، مناسب پوست خشک و حساس.",
    specs: { "حجم": "50ml", "نوع پوست": "خشک و حساس" },
  },
  {
    name: "رژ لب مات ماندگار",
    price: 320000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Lipstick"],
    category: "آرایش",
    brand: "وستا بیوتی",
    stock: 40,
    description: "رژ لب مات با ماندگاری بالا و بافت مخملی، بدون خشکی لب.",
    specs: { "رنگ": "رزگلد", "ماندگاری": "تا ۸ ساعت" },
  },
  {
    name: "پالت سایه چشم ۱۲ رنگ",
    price: 780000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Palette"],
    category: "آرایش",
    brand: "وستا بیوتی",
    stock: 18,
    description: "پالت ۱۲ رنگ با ترکیب مات و شیمری، مناسب آرایش روزانه و شب.",
    specs: { "تعداد رنگ": "12", "بافت": "مات و شیمری" },
  },
  {
    name: "شامپو تقویت‌کننده مو با روغن آرگان",
    price: 410000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Shampoo"],
    category: "مراقبت مو",
    brand: "آرگانیکا",
    stock: 35,
    description: "شامپو بدون سولفات، تقویت‌کننده و ضدریزش با عصاره‌ی روغن آرگان.",
    specs: { "حجم": "400ml", "نوع مو": "خشک و آسیب‌دیده" },
  },
  {
    name: "ماسک مو کراتینه احیاکننده",
    price: 520000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Hair+Mask"],
    category: "مراقبت مو",
    brand: "آرگانیکا",
    stock: 20,
    description: "ماسک موی کراتینه برای احیای موهای آسیب‌دیده و شکننده.",
    specs: { "حجم": "250ml" },
  },
  {
    name: "ادکلن گلد ادوپرفیوم زنانه",
    price: 1450000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Perfume"],
    category: "عطر و ادکلن",
    brand: "پرل پرفیوم",
    stock: 12,
    description: "رایحه‌ی گرم و شرقی با ماندگاری بالا، مناسب استفاده روزانه و مهمانی.",
    specs: { "حجم": "50ml", "خانواده رایحه": "شرقی-گرم" },
  },
  {
    name: "ست مسواک و خمیردندان سفیدکننده",
    price: 280000,
    images: ["https://placehold.co/400x400/FFFFFF/C592A8?text=Oral+Care"],
    category: "بهداشت شخصی",
    brand: "دنتاکر",
    stock: 45,
    description: "ست بهداشت دهان و دندان با فرمول سفیدکننده و ضدحساسیت.",
    specs: { "شامل": "مسواک + خمیردندان" },
  },
];

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected. Seeding products...");
  for (const p of products) {
    await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
    console.log("  +", p.name);
  }
  console.log(`Done — ${products.length} products upserted.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
