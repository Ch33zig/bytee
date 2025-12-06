import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bytee - Waste Less Food, Eat Better",
  description: "Scan receipts to track your groceries, get alerts before food expires, and discover recipes using what you already have.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
