import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMIS — Metro Transit Upgrade",
  description: "PMBOK 7 Project Management Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
