import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CMS - Content Management System",
  description: "Dynamic Form Generation CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

