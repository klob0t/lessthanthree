import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "./lib/utils/Lenis";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "hello",
  description: "hi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable}`}>
      <LenisProvider />
        {children}
      </body>
    </html>
  );
}
