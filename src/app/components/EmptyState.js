import Link from "next/link";

const icons = {
  cart: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  ),
  heart: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
    </svg>
  ),
  box: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z" />
      <path d="M3.5 8v8L12 20.5 20.5 16V8" />
      <path d="M12 12.5V20.5" />
    </svg>
  ),
  search: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  ),
  chat: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

export default function EmptyState({ icon = "box", title, text, actionHref, actionLabel }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gold-soft/20 text-gold flex items-center justify-center mb-5">
        {icons[icon] || icons.box}
      </div>
      <p className="text-ink font-medium mb-1">{title}</p>
      {text && <p className="text-ink-muted text-sm mb-6 max-w-xs">{text}</p>}
      {actionHref && (
        <Link href={actionHref} className="px-6 py-3 rounded-sm bg-gold text-base font-semibold hover:bg-gold-soft transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
