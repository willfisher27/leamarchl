import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Lea Marchl", template: "%s — Lea Marchl" },
  description: "Lea Marchl, reporter at Freedom of the Press Foundation.",
  // The whole site is behind a login, so keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable} font-sans antialiased`}>
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 sm:px-8">
          <Header />
          <main className="flex-1 py-10 sm:py-14">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
