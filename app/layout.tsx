import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eclipse V2",
  description: "Decentralized P2P Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white">
          <div className="container mx-auto px-4 py-3">
            <h1 className="text-xl font-bold text-white">Eclipse V2</h1>
          </div>
        </header>
        <main className="pt-[57px] min-h-screen bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}
