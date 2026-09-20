import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ratu KOPI - POS Kasir Warkop",
  description: "Aplikasi kasir tablet ramah pengguna untuk Warkop Ratu KOPI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#291811",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="h-full w-full overflow-hidden bg-[#FAF7F2] text-[#291811]">
        {children}
      </body>
    </html>
  );
}
