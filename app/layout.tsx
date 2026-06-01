import type { Metadata } from "next";

import "@/app/globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "AI Interview",
  description: "Premium AI-powered mock interview frontend foundation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[hsl(var(--background))] font-[var(--font-body)] text-[hsl(var(--foreground))] antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
