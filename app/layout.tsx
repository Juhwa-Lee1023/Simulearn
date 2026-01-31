import type { Metadata } from "next";
import { DM_Mono, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulearn Prototype",
  description: "Simulearn v0.1.0 prototype workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${spaceGrotesk.variable} ${dmMono.variable} ${fraunces.variable} antialiased`}
      >
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
