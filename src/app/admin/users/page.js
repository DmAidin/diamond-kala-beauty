"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (user) => {
    setSavingId(user.id);
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">مدیریت کاربران</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-base-panel border border-base-line rounded-sm text-sm">
            <thead>
              <tr className="text-ink-muted text-right border-b border-base-line">
                <th className="py-3 px-4">نام</th>
                <th className="py-3 px-4">ایمیل</th>
                <th className="py-3 px-4">نقش</th>
                <th className="py-3 px-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-base-line last:border-0">
                  <td className="py-3 px-4 text-ink">{u.name}</td>
                  <td className="py-3 px-4 text-ink-muted font-mono" dir="ltr">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-sm border ${u.role === "admin" ? "text-gold border-gold" : "text-ink-muted border-base-line"}`}>
                      {u.role === "admin" ? "مدیر" : "کاربر"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.id === session?.user?.id ? (
                      <span className="text-ink-faint text-xs">شما</span>
                    ) : (
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={savingId === u.id}
                        className="text-gold text-sm hover:underline disabled:opacity-50"
                      >
                        {u.role === "admin" ? "حذف دسترسی ادمین" : "ارتقا به ادمین"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
