import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LenisProvider from "./lib/utils/Lenis";


const serif = localFont({
  src: [
    {
      path: './assets/fonts/ultralight.otf',
      weight: '400',
      style: 'normal'
    },
    {
      path: './assets/fonts/Milton_One_Bold.otf',
      weight: '400',
      style: 'italic'
    },
  ],
  variable: '--serif'
});


export const metadata: Metadata = {
  title: "Dear, Muthia",
  description: "hi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en" className={`${serif.variable}`}>
      <body >
        <LenisProvider />
        {children}
      </body>
    </html>
  );
}
