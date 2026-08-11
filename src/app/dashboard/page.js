import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectToDB } from "../../utils/database";
import Order from "../../models/order";
import DashboardNav from "../components/DashboardNav";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await connectToDB();
  const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(5);
  const paidCount = await Order.countDocuments({ userId: session.user.id, status: "paid" });
  const pendingCount = await Order.countDocuments({ userId: session.user.id, status: "pending" });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="w-full sm:w-56 shrink-0">
          <DashboardNav isAdmin={session.user.role === "admin"} />
        </aside>

        <div className="flex-1 space-y-8">
          <header className="border-b border-base-line pb-6">
            <h1 className="font-display text-3xl text-ink">خوش آمدی، {session.user.name}</h1>
            <p className="text-ink-muted text-sm mt-2 font-mono">{session.user.email}</p>
          </header>

          <section className="grid grid-cols-2 gap-5">
            <div className="bg-base-panel border border-base-line rounded-sm p-6">
              <p className="text-ink-muted text-sm mb-2">سفارش‌های پرداخت‌شده</p>
              <p className="text-4xl font-display text-gold">{paidCount}</p>
            </div>
            <div className="bg-base-panel border border-base-line rounded-sm p-6">
              <p className="text-ink-muted text-sm mb-2">در انتظار پرداخت</p>
              <p className="text-4xl font-display text-signal-warn">{pendingCount}</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-4">آخرین سفارش‌ها</h2>
            {orders.length === 0 ? (
              <p className="text-ink-muted text-sm">هنوز سفارشی ثبت نکرده‌اید.</p>
            ) : (
              <div className="bg-base-panel border border-base-line rounded-sm divide-y divide-base-line">
                {orders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between px-5 py-4 text-sm">
                    <span className="font-mono text-ink-faint">#{String(o._id).slice(-6)}</span>
                    <span className="text-ink">{o.totalPrice.toLocaleString()} تومان</span>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid: { label: "پرداخت‌شده", cls: "text-signal-ok border-signal-ok" },
    pending: { label: "در انتظار", cls: "text-signal-warn border-signal-warn" },
    failed: { label: "ناموفق", cls: "text-signal-bad border-signal-bad" },
  };
  const s = map[status] || map.pending;
  return <span className={`text-xs px-2 py-1 rounded-sm border ${s.cls}`}>{s.label}</span>;
}
