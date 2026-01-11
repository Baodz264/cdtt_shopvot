import "../globals.css";
import { ToastProvider } from "@/context/ToastProvider"; // import provider từ client component

export const metadata = {
  title: "ShopVOT",
  description: "ShopVOT Backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap toàn bộ ứng dụng với ToastProvider */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
