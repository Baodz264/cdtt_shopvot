import React from "react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import "../globals.css";
import ToastProvider from "@/context/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "ShopVot",
  description: "Cửa hàng bán vợt chất lượng",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" translate="no">
      <head>
        {/* 🚫 Chặn Google / Microsoft auto translate */}
        <meta name="google" content="notranslate" />
      </head>

      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <Header />

            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>

            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
