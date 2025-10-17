import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import WasmpathProvider from "./WasmpathProvider";
import FloatBall from "@/components/FloatBall";
import HotkeyListener from "@/components/HotkeyListener";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "magicyan418",
  description: "everything you need to know about magicyan418 pixel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 全局导入dotlottie-player.wasm */}
        <WasmpathProvider />
        <HotkeyListener />
        <FloatBall />
        {children}
      </body>
    </html>
  );
}
