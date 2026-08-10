export const metadata = {
  title: "درباره ما | فروشگاه آنلاین لوازم آرایشی و بهداشتی دایمند کالا",
  description: "دایمند کالا، فروشگاه اینترنتی لوازم آرایشی و بهداشتی اورجینال با ضمانت اصالت، ارسال سریع و پرداخت امن.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <p className="font-mono text-gold text-xs tracking-[0.3em] mb-4">ABOUT / DIAMOND KALA</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-8">درباره فروشگاه دایمند کالا</h1>

      <div className="cascade-line max-w-xs mb-10" />

      <div className="space-y-6 text-ink-muted leading-8">
        <p>
          دایمند کالا فروشگاه اینترنتی لوازم آرایشی و بهداشتی است که با هدف عرضه‌ی مستقیم و مطمئن محصولات اورجینال — از مراقبت پوست و مو گرفته تا آرایش و عطر — راه‌اندازی شده است. هر محصول پیش از عرضه بررسی می‌شود و مشخصات کامل آن (ترکیبات، نوع پوست مناسب، حجم و برند) به‌طور شفاف در صفحه‌ی محصول درج می‌شود.
        </p>
        <p>
          فرآیند خرید در دایمند کالا ساده و امن است: انتخاب محصول، تکمیل اطلاعات ارسال، و پرداخت از طریق درگاه بانکی رمزنگاری‌شده. سفارش‌ها با بسته‌بندی ویژه آماده و ارسال می‌شوند تا محصول سالم و دست‌نخورده به دست شما برسد.
        </p>
        <p>
          دایمند کالا به‌طور مداوم برندها و محصولات جدید را به فروشگاه اضافه می‌کند و برای هر دسته، همان استاندارد اصالت و شفافیت را حفظ می‌کند.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Pillar title="۱۰۰٪ اورجینال" text="اصالت هر محصول پیش از ارسال بررسی می‌شود." />
        <Pillar title="بسته‌بندی ویژه" text="ارسال ایمن با بسته‌بندی مراقبت‌شده مخصوص لوازم آرایشی." />
        <Pillar title="پشتیبانی مستقیم" text="برای هر سوال درباره‌ی محصول می‌توانید با ما در ارتباط باشید." />
      </div>
    </main>
  );
}

function Pillar({ title, text }) {
  return (
    <div className="pastel-card bg-base-panel border border-base-line p-5">
      <h3 className="text-gold font-display mb-2">{title}</h3>
      <p className="text-ink-muted text-sm leading-6">{text}</p>
    </div>
  );
}
