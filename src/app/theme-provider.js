"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Wraps next-themes. defaultTheme is "light" on purpose — this store's
// audience (including the shop owner) prefers a light storefront by
// default; dark mode is available from the toggle in the navbar but is
// never forced on anyone.
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
