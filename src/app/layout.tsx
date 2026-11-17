import type { Metadata } from "next";
import { Parisienne } from "next/font/google";
import "./globals.css";

const parisienne = Parisienne({
  variable: "--font-parisienne",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noli & Eling — You are invited",
  description: "12/12 · 7:00 AM · Transfiguration of Christ Parish Church",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${parisienne.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
