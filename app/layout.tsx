import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Code Gloss",
  description: "All about the code gloss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-lime-50 px-10">{children}</body>
    </html>
  );
}
