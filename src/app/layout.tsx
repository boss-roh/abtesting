import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import AuthGuard from "./components/AuthGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A/B Testing Tool",
  description: "Simple A/B testing tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f8fa]">
        <Header />
        <main className="flex-1">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </body>
    </html>
  );
}
