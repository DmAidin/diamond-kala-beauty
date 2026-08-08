import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-signal-bad text-xs tracking-widest mb-4">403 / ACCESS DENIED</p>
      <h1 className="font-display text-2xl text-ink mb-6">شما اجازه دسترسی به این صفحه را ندارید</h1>
      <Link href="/" className="px-6 py-3 rounded-sm bg-gold text-base font-semibold">
        بازگشت به فروشگاه
      </Link>
    </main>
  );
}
