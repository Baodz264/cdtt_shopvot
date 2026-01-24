"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  FaShoppingCart,
  FaUserCircle,
  FaBars,
  FaChevronDown,
  FaInfoCircle,
  FaPercentage,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";
import SearchBox from "@/components/client/home/SearchBox";
import MenuService, { Menu } from "@/services/MenuService";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menus, setMenus] = useState<Menu[]>([]);

  const { user, logout, loading } = useAuth();
  const accountRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!user;

  /* ================= MENU CỨNG – KHÔNG ĐƯỢC MẤT ================= */
  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/posts", label: "Bài viết", icon: <FaInfoCircle /> },
    { href: "/promotions", label: "Khuyến mãi", icon: <FaPercentage className="text-orange-500" /> },
    { href: "/contact", label: "Liên hệ", icon: <FaPhoneAlt /> },
  ];

  /* ================= FETCH MENU API ================= */
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await MenuService.list({
          status: 1,
          limit: 100,
        });
        setMenus(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMenus();
  }, []);

  /* ================= MAP MENU CON THEO LINK CHA ================= */
  const dropdownMap: Record<string, Menu[]> = {
    "/products": menus.filter(m => m.type === "category"),
    "/posts": menus.filter(m => m.type === "post"),
  };

  /* ================= CLICK OUTSIDE ACCOUNT ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= CART COUNT ================= */
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.id) return;
      try {
        const cart = await CartService.getCart(user.id);
        const items = await CartItemService.list(cart.id);
        setCartCount(items.reduce((a, i) => a + i.quantity, 0));
      } catch (e) {
        console.log(e);
      }
    };
    fetchCartCount();
  }, [user]);

  if (loading) return null;

  return (
    <>
      {/* TOP BAR */}
      <div className="w-full bg-gray-900 text-white py-2 text-[11px] uppercase font-bold text-center">
        🔥 Giảm giá 20% cho tất cả vợt Yonex trong tháng này! 🔥
      </div>

      <div className="sticky top-0 z-50 px-4 py-3">
        <header className="container mx-auto max-w-7xl h-20 bg-white/80 backdrop-blur rounded-3xl shadow flex items-center justify-between px-6">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 font-black text-2xl">
            <div className="w-9 h-9 bg-orange-600 text-white flex items-center justify-center rounded-lg">
              V
            </div>
            SHOP<span className="text-orange-600">VỢT</span>
          </Link>

          {/* ================= NAV DESKTOP ================= */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => {
              const children = dropdownMap[item.href] || [];

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-2"
                  >
                    {item.icon}
                    {item.label}
                    {children.length > 0 && <FaChevronDown size={10} />}
                  </Link>

                  {/* DROPDOWN */}
                  {children.length > 0 && (
                    <div
                      className="
                        absolute left-0 top-full mt-2
                        invisible opacity-0 group-hover:visible group-hover:opacity-100
                        transition-all duration-200
                        bg-white shadow-lg rounded-2xl min-w-[220px] p-2
                      "
                    >
                      {children.map(child => (
                        <Link
                          key={child.id}
                          href={child.link || "#"}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ================= ACTIONS ================= */}
          <div className="flex items-center gap-3">
            <SearchBox />

            {/* CART */}
            <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-black flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="h-10 px-2 flex items-center gap-2 bg-gray-900 text-white rounded-full"
              >
                {isLoggedIn ? (
                  <img
                    src={user?.avatar ? `http://localhost:8000${user.avatar}` : "/avatar-default.png"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle size={20} />
                )}
                <FaChevronDown size={10} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white shadow rounded-2xl p-2"
                  >
                    {isLoggedIn ? (
                      <>
                        <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 rounded-xl">
                          Tài khoản
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="block px-4 py-2 bg-gray-900 text-white rounded-xl text-center">
                          Đăng nhập
                        </Link>
                        <Link href="/auth/register" className="block px-4 py-2 border rounded-xl text-center mt-2">
                          Đăng ký
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE */}
            <button onClick={() => setMenuOpen(true)} className="lg:hidden w-10 h-10 bg-gray-100 rounded-full">
              <FaBars />
            </button>
          </div>
        </header>
      </div>
    </>
  );
}
