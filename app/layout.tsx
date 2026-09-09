import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

// Display font — títulos em uppercase/italic
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Body font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackTown",
  description:
    "HackTown — programação, agenda e mapa do maior festival de inovação e criatividade.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
