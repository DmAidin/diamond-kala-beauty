export const metadata = { title: "حریم خصوصی | دایمند کالا" };

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-8">حریم خصوصی</h1>
      <div className="space-y-5 text-ink-muted leading-8 text-sm">
        <p>اطلاعاتی که هنگام ثبت‌نام و ثبت سفارش وارد می‌کنید (نام، ایمیل، شماره تماس، آدرس) فقط برای پردازش و ارسال سفارش شما استفاده می‌شود.</p>
        <p>اطلاعات پرداخت مستقیماً توسط درگاه بانکی پردازش می‌شود و این فروشگاه هیچ‌گاه شماره کارت یا اطلاعات حساب بانکی شما را ذخیره نمی‌کند.</p>
        <p>اطلاعات شما بدون رضایت شما در اختیار اشخاص ثالث قرار نمی‌گیرد، مگر در مواردی که قانون الزام کند.</p>
      </div>
    </main>
  );
}
