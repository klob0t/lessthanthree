export const metadata = {
  title: "<3"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "pink" }}>{children}</body>
    </html>
  );
}
