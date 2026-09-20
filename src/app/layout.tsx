import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Botánica Maferefun",
  description: "Artículos de Osha e Ifá, con respeto y oficio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FAF7F2] text-[#241B16] antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
