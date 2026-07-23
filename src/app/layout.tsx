import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Painel de Competitividade | Martins",
  description: "Dashboard de competitividade de precos Martins x Mercado"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable + " font-body bg-surface text-ink-900 antialiased"}>
        {children}
      </body>
    </html>
  );
}
