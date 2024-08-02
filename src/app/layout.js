import "./globals.css";
export const metadata = {
  title: "<3"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
