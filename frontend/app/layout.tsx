import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chat App Capstone",
  description: "Production-ready AI chat app with OpenRouter and Tavily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
