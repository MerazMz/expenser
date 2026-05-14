import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Expenser | Daily Expense Tracker",
  description: "Simple, modern, and fast personal daily expense tracking.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export const dynamic = "force-dynamic";

import { BottomNav } from "@/components/layout/bottom-nav";
import { getSettings, resetMonth } from "@/actions/settings";
import { format } from "date-fns";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auto-generate new month if needed
  const settings = await getSettings();
  if (settings) {
    const now = new Date();
    const currentMonth = format(now, "yyyy-MM");
    if (settings.currentMonth !== currentMonth) {
      await resetMonth();
    }
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="relative flex min-h-screen flex-col pb-20">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" expand={false} richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
