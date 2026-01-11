"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaShoppingCart,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSearch,
  FaChevronDown,
  FaPercentage,
  FaInfoCircle,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";
import ProductService, { ProductListParams } from "@/services/ProductService";
import { Spin } from "antd";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  thumbnail?: string;
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { user, logout, loading } = useAuth();
  const accountRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!user;
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Trang chủ", icon: null },
    { href: "/products", label: "Sản phẩm", icon: null },
    {
      href: "/posts",
      label: "Bài viết",
      icon: <FaInfoCircle className="text-xs" />,
    },
    {
      href: "/promotions",
      label: "Khuyến mãi",
      icon: <FaPercentage className="text-orange-500" />,
    },
    {
      href: "/contact",
      label: "Liên hệ",
      icon: <FaPhoneAlt className="text-xs" />,
    },
  ];

  // 🔹 Handle click outside account dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.id) return;
      try {
        const cart = await CartService.getCart(user.id);
        const items = await CartItemService.list(cart.id);
        const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalQty);
      } catch (err) {
        console.log("Failed to fetch cart count:", err);
      }
    };
    fetchCartCount();
  }, [user]);

  // 🔹 Handle search enter or click
  const handleSearch = (slug?: string) => {
    if (slug) {
      setSearchOpen(false);
      router.push(`/products/${slug}`);
    } else if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 🔹 Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params: ProductListParams = { search: searchQuery, limit: 5, status: 1 };
        const res = await ProductService.list(params);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.log("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (loading) return null;

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="w-full bg-gray-900 text-white py-2 text-[11px] uppercase tracking-[0.2em] font-bold text-center z-[110] relative">
        🔥 Giảm giá 20% cho tất cả vợt Yonex trong tháng này! 🔥
      </div>

      <div className="sticky top-0 w-full z-[100] px-4 py-3">
        <header className="container mx-auto max-w-7xl h-20 bg-white/80 backdrop-blur-2xl rounded-[1.5rem] border border-white/50 shadow-[0_15px_35px_rgba(0,0,0,0.08)] flex items-center justify-between px-6 transition-all duration-500">
          {/* LOGO */}
          <Link href="/" className="flex flex-col group leading-none">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-300">
                <span className="text-white font-black text-xl italic">V</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">
                SHOP<span className="text-orange-600">VỢT</span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest pl-11 hidden md:block">
              Nâng tầm cú đánh của bạn
            </span>
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all flex items-center gap-2"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* SEARCH */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    placeholder="Tìm sản phẩm, thương hiệu..."
                    className="bg-gray-100 rounded-full h-10 pl-4 pr-10 outline-none text-sm font-medium border border-gray-200 focus:border-orange-500 transition-all shadow-inner"
                    autoFocus
                  />
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  if (searchOpen && searchQuery.trim()) {
                    handleSearch();
                  } else {
                    setSearchOpen(!searchOpen);
                  }
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  searchOpen
                    ? "absolute right-0 text-orange-600"
                    : "bg-gray-100 hover:bg-orange-600 hover:text-white"
                }`}
              >
                {searchOpen ? <FaTimes size={14} /> : <FaSearch size={14} />}
              </button>

              {/* DROPDOWN SEARCH RESULTS */}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-12 left-0 w-[300px] max-h-80 overflow-y-auto bg-white shadow-xl rounded-2xl z-50 border border-gray-200">
                  {searchLoading && (
                    <div className="flex justify-center py-6">
                      <Spin />
                    </div>
                  )}
                  {!searchLoading && searchResults.length === 0 && (
                    <div className="p-4 text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
                  )}
                  {!searchLoading &&
                    searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSearch(product.slug)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition cursor-pointer rounded-xl"
                      >
                        <img
                          src={product.thumbnail ? `http://localhost:8000${product.thumbnail}` : "/placeholder.png"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-bold truncate">{product.name}</span>
                          <span className="text-orange-600 text-xs font-black">
                            {product.sale_price ? product.sale_price.toLocaleString() : product.price.toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* CART ICON */}
            <Link
              href="/cart"
              className="relative group w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-900 hover:text-white rounded-full transition-all duration-300"
            >
              <FaShoppingCart size={16} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white group-hover:animate-bounce">
                {cartCount}
              </span>
            </Link>

            {/* ACCOUNT */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="h-10 px-2 flex items-center gap-2 bg-gray-900 text-white rounded-full hover:bg-orange-700 transition-all"
              >
                {isLoggedIn ? (
                  <img
                    src={user?.avatar ? `http://localhost:8000${user.avatar}` : "/avatar-default.png"}
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full">
                    <FaUserCircle size={18} />
                  </div>
                )}
                <FaChevronDown
                  size={8}
                  className={`mr-1 transition-transform duration-300 ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-60 bg-white shadow-[0_25px_50px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden p-2 border border-gray-100"
                  >
                    {isLoggedIn ? (
                      <div className="flex flex-col">
                        <div className="p-4 bg-gray-50 rounded-2xl mb-2 text-center">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            Thành viên
                          </p>
                          <p className="font-black text-gray-800 truncate">{user?.name}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                        >
                          Thông tin tài khoản
                        </Link>
                        <button
                          onClick={logout}
                          className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition text-left mt-1"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        <Link
                          href="/auth/login"
                          className="block w-full text-center py-3 bg-gray-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-orange-600 transition"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          href="/auth/register"
                          className="block w-full text-center py-3 border border-gray-200 text-gray-800 font-black text-xs uppercase rounded-2xl hover:bg-gray-50 transition"
                        >
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <FaBars />
            </button>
          </div>
        </header>
      </div>

      {/* MOBILE SIDEBAR MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white z-[160] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-black italic">SHOPVỢT</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>
              <ul className="space-y-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-3xl font-black text-gray-900 hover:text-orange-600 transition lowercase tracking-tighter"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
