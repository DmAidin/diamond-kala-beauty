import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../lib/prisma";
import { connectToDB } from "../../utils/database";
import Product from "../../models/product";
import Order from "../../models/order";
import PageView from "../../models/pageView";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/auth/unauthorized");

  await connectToDB();
  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  const [usersCount, productsCount, ordersCount, revenueAgg, lowStock, todayViews] = await Promise.all([
    prisma.user.count(),
    Product.countDocuments(),
    Order.countDocuments({ status: "paid" }),
    Order.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, sum: { $sum: "$totalPrice" } } }]),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6),
    PageView.findOne({ date: todayKey }),
  ]);
  const revenue = revenueAgg[0]?.sum || 0;

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const viewRecords = await PageView.find({ date: { $in: last7Days } });
  const viewMap = Object.fromEntries(viewRecords.map((r) => [r.date, r.count]));
  const viewSeries = last7Days.map((date) => ({
    label: new Date(date).toLocaleDateString("fa-IR", { weekday: "short", day: "numeric", month: "short" }),
    count: viewMap[date] || 0,
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="w-full sm:w-56 shrink-0">
          <nav className="flex flex-wrap sm:flex-col gap-2 text-sm">
            <Link href="/admin" className="px-4 py-2 rounded-sm bg-base-panel border border-gold/50 text-gold">
              نمای کلی
            </Link>
            <Link href="/admin/products" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              محصولات
            </Link>
            <Link href="/admin/orders" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              سفارش‌ها
            </Link>
            <Link href="/admin/coupons" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              کدهای تخفیف
            </Link>
            <Link href="/admin/users" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              کاربران
            </Link>
            <Link href="/admin/messages" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              پیام‌ها
            </Link>
            <Link href="/admin/chat" className="px-4 py-2 rounded-sm border border-base-line text-ink-muted hover:border-gold/50">
              گفتگوی پشتیبانی
            </Link>
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-base-line pb-6 mb-8">
            <h1 className="font-display text-3xl text-ink">پنل مدیریت</h1>
            <p className="text-ink-muted text-sm mt-2">خوش آمدی، {session.user.name}</p>
          </header>

          <section className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
            <Stat label="بازدید امروز" value={todayViews?.count || 0} />
            <Stat label="کاربران" value={usersCount} />
            <Stat label="محصولات" value={productsCount} />
            <Stat label="سفارش‌های پرداخت‌شده" value={ordersCount} />
            <Stat label="درآمد (تومان)" value={revenue.toLocaleString()} accent />
          </section>

          <section className="mb-10">
            <h2 className="font-display text-lg text-ink mb-4">بازدید ۷ روز اخیر</h2>
            <div className="bg-base-panel border border-base-line rounded-sm divide-y divide-base-line">
              {viewSeries.map((d) => (
                <div key={d.label} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-ink-muted">{d.label}</span>
                  <span className="text-ink font-mono">{d.count}</span>
                </div>
              ))}
            </div>
          </section>

          {lowStock.length > 0 && (
            <section>
              <h2 className="font-display text-lg text-ink mb-4">موجودی رو به اتمام</h2>
              <div className="bg-base-panel border border-signal-warn/40 rounded-sm divide-y divide-base-line">
                {lowStock.map((p) => (
                  <div key={p._id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-ink">{p.name}</span>
                    <span className="text-signal-warn font-mono">{p.stock} عدد باقی‌مانده</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-base-panel border border-base-line rounded-sm p-6">
      <p className="text-ink-muted text-sm mb-2">{label}</p>
      <p className={`text-3xl font-display ${accent ? "text-gold" : "text-ink"}`}>{value}</p>
    </div>
  );
}
