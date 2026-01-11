import React from "react";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminSidebar from "../../../components/admin/AdminSidebar"; // giờ là client
import AdminFooter from "../../../components/admin/AdminFooter";
import "../../globals.css";
import { ToastProvider } from "@/context/ToastProvider";

export const metadata = {
  title: "ShopVot Admin",
  description: "Bảng điều khiển quản trị ShopVot",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <ToastProvider>
        {/* SIDEBAR */}
        <AdminSidebar />

        {/* MAIN WRAPPER */}
        <div className="flex flex-col flex-1">
          {/* HEADER */}
          <AdminHeader />

          {/* CONTENT */}
          <main className="flex-1 p-6">{children}</main>

          {/* FOOTER */}
          <AdminFooter />
        </div>
        </ToastProvider>
      </body>
    </html>
  );
}
