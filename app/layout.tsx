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
      <body className="bg-[#FFFDEA] px-10">
        <p className="text-[#EB6393] text-4xl ml-3">The</p>
        <p className="text-[#C4338E] text-4xl ml-10">Code</p>
        <p className="text-[#D53815] text-4xl">Gloss</p>
        <p className="text-[#780068] text-4xl ml-5">!!!</p>
        {children}
      </body>
    </html>
  );
}
