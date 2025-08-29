import type { Metadata } from "next";
import { Cormorant_Upright } from "next/font/google";
import "./globals.css";
import LenisProvider from "./lib/utils/Lenis";


const serif = Cormorant_Upright({
  weight: ['400', ],
  style: ['normal'],
  variable: '--serif'
});


export const metadata: Metadata = {
  title: "hello",
  description: "hi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body className={`${serif.variable}`}>
      <LenisProvider />
        {children}
      </body>
    </html>
  );
}
