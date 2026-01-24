"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText,
  Settings,
  Inbox,
  Zap,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Ticket,
  Star, // Thêm icon Star cho phần Đánh giá
} from "lucide-react";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    title: "Sản phẩm",
    icon: ShoppingBag,
    children: [
      { title: "Tất cả sản phẩm", href: "/admin/products" },
      { title: "Sản phẩm sale", href: "/admin/product-sales" },
      { title: "Sản phẩm mới", href: "/admin/product-news" },
      { title: "Thương hiệu", href: "/admin/brands" },
      { title: "Danh mục", href: "/admin/categories" },
    ],
  },
  {
    title: "Đơn hàng",
    icon: Inbox,
    children: [
      { title: "Danh sách đơn", href: "/admin/orders" },
      { title: "Thanh toán", href: "/admin/payments" },
    ],
  },
  { title: "Người dùng", icon: Users, href: "/admin/users" },
  { title: "Kho hàng", icon: Inbox, href: "/admin/imports" },
  {
    title: "Nội dung",
    icon: FileText,
    children: [
      { title: "Banner", href: "/admin/banners" },
      { title: "Chủ đề", href: "/admin/topics" },
      { title: "Bài viết", href: "/admin/posts" },
    ],
  },
  {
    title: "Giảm giá",
    icon: Ticket,
    children: [
      { title: "Vouchers", href: "/admin/vouchers" },
      { title: "Lượt dùng Voucher", href: "/admin/voucher-users" },
    ],
  },
  { title: "Đánh giá", icon: Star, href: "/admin/reviews" }, // Đã bổ sung mục Đánh giá
  {
    title: "Hệ thống",
    icon: Settings,
    children: [
      { title: "Liên hệ", href: "/admin/contacts" },
      { title: "Cài đặt", href: "/admin/settings" },
      { title: "Menu", href: "/admin/menu" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isCollapsed) {
      menu.forEach((item) => {
        if (item.children?.some((child) => child.href === pathname)) {
          setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
        }
      });
    }
  }, [pathname, isCollapsed]);

  const toggleMenu = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenMenus({ [title]: true });
    } else {
      setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
    }
  };

  return (
    <aside
      className={`min-h-screen bg-[#0f172a] text-slate-300 sticky top-0 border-r border-slate-800/50 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center gap-3 py-8 ${isCollapsed ? "justify-center" : "px-7"}`}>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
          <Zap size={22} className="text-white fill-white/20" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden">
            SHOPVOT<span className="text-blue-500">STORE</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar pb-10 overflow-x-hidden">
        {menu.map((item, i) => {
          const hasChildren = !!item.children;
          const isOpen = openMenus[item.title];
          const isActive = pathname === item.href || item.children?.some((c) => c.href === pathname);

          return (
            <div key={i} className="space-y-1">
              {hasChildren ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isCollapsed ? "justify-center" : "justify-between"
                    } ${isActive ? "text-white bg-slate-800/50" : "hover:bg-slate-800/40 hover:text-slate-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={`${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"}`}
                      />
                      {!isCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">{item.title}</span>}
                    </div>
                    {!isCollapsed && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </button>

                  {!isCollapsed && isOpen && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-800/50 pl-2">
                      {item.children?.map((child, j) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={j}
                            href={child.href}
                            className={`block px-4 py-2 rounded-lg text-[13px] transition-all relative ${
                              isChildActive ? "text-blue-400 font-semibold" : "text-slate-500 hover:text-slate-200"
                            }`}
                          >
                            {isChildActive && (
                              <span className="absolute left-[-13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                            )}
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    pathname === item.href
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                      : "hover:bg-slate-800/40 hover:text-slate-100"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`${pathname === item.href ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"}`}
                  />
                  {!isCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">{item.title}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer - Toggle Button */}
      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-3 p-2.5 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <>
              <PanelLeftClose size={20} />
              <span className="text-sm font-medium">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}