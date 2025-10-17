import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "A web dashboard built with Next.js, Tailwind, and Chart.js",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[linear-gradient(57.72deg,_#FEFCE8_0%,_#F2F2F8_33%,_#FAF9F7_66%,_#FFF7ED_100%)] min-h-screen antialiased ">
        {children}
      </body>
    </html>
  );
}
