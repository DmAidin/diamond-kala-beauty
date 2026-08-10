// All "today"/daily-bucket logic (order numbers, visit analytics) must key
// off Tehran's calendar day, not the server's — Vercel's functions run in
// UTC, so a naive `new Date()` flips to the next day ~3.5 hours early for
// Iran and puts a chunk of the evening's activity in the wrong bucket.

const TEHRAN_TZ = "Asia/Tehran";

// Returns "YYYY-MM-DD" for the given moment, as a Tehran calendar date.
export function tehranDateKey(date = new Date()) {
  // en-CA locale formats as YYYY-MM-DD, which is what we want directly
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TEHRAN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// "YYMMDD" — used inside human-readable order numbers (DK-260808-0007)
export function tehranDateStamp(date = new Date()) {
  return tehranDateKey(date).slice(2).replace(/-/g, "");
}
