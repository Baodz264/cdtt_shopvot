"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

import SettingService, { Setting } from "@/services/SettingService";
import MenuService, { Menu } from "@/services/MenuService";

const IMAGE_BASE = "http://localhost:8000"; // giống admin

export default function Footer() {
  const [setting, setSetting] = useState<Setting | null>(null);
  const [footerMenus, setFooterMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [settingRes, menuRes] = await Promise.all([
          SettingService.list({ limit: 1 }),
          MenuService.list({ position: "footer", status: 1 }),
        ]);

        if (settingRes.data?.length) {
          setSetting(settingRes.data[0]);
        }

        setFooterMenus(menuRes.data || []);
      } catch (error) {
        console.error("Lỗi load footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  /* ================= TÁCH MENU ================= */
  const policyMenus = footerMenus.filter(m => m.type === "category");
  const supportMenus = footerMenus.filter(m => m.type === "custom");

  /* ================= SKELETON ================= */
  if (loading) {
    return (
      <footer className="bg-slate-900 py-12 animate-pulse">
        <div className="container mx-auto px-4 h-32 bg-slate-800 rounded-lg" />
      </footer>
    );
  }

  return (
    <footer className="bg-[#0f172a] text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* ===== CỘT 1: LOGO + THƯƠNG HIỆU ===== */}
        <div className="space-y-4">
          {/* LOGO */}
          {setting?.logo && (
            <img
              src={IMAGE_BASE + setting.logo}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          )}

          {/* TÊN SHOP */}
          <h3 className="text-white text-2xl font-black italic leading-none">
            {setting?.name?.toUpperCase() || "SHOPVOT"}
            <span className="text-orange-500">.</span>
          </h3>

          <p className="text-sm leading-relaxed">
            Nâng tầm những cú đập cầu của bạn. Chúng tôi cung cấp các dòng vợt
            chuyên nghiệp nhất cho mọi vận động viên.
          </p>

          {/* SOCIAL */}
          <div className="flex space-x-3 pt-2">
            <a className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-blue-600 transition">
              <FaFacebookF />
            </a>
            <a className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-pink-600 transition">
              <FaInstagram />
            </a>
            <a className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-red-600 transition">
              <FaYoutube />
            </a>
            <a className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-sky-500 transition">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* ===== CỘT 2: LIÊN HỆ ===== */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Thông tin liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <FaMapMarkerAlt className="text-orange-500 mt-1" />
              <span>{setting?.address}</span>
            </li>
            <li className="flex gap-3">
              <FaPhoneAlt className="text-orange-500" />
              <span className="text-slate-200">
                {setting?.hotline || setting?.phone}
              </span>
            </li>
            <li className="flex gap-3">
              <FaEnvelope className="text-orange-500" />
              <span>{setting?.email}</span>
            </li>
            <li className="flex gap-3 text-xs text-slate-500 border-t border-slate-800 pt-3">
              <FaClock />
              <span>8:00 - 20:00 (Thứ 2 - CN)</span>
            </li>
          </ul>
        </div>

        {/* ===== CỘT 3: CHÍNH SÁCH ===== */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Chính sách</h4>
          <ul className="grid gap-2 text-sm">
            {policyMenus.map(menu => (
              <li key={menu.id}>
                <Link
                  href={menu.link || "#"}
                  className="hover:text-orange-400 transition flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-[1px] bg-orange-400 mr-0 group-hover:mr-2 transition-all" />
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== CỘT 4: HỖ TRỢ ===== */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Hỗ trợ khách hàng</h4>
          <ul className="grid gap-2 text-sm">
            {supportMenus.map(menu => (
              <li key={menu.id}>
                <Link
                  href={menu.link || "#"}
                  className="hover:text-orange-400 transition flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-[1px] bg-orange-400 mr-0 group-hover:mr-2 transition-all" />
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== COPYRIGHT ===== */}
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex justify-between text-xs uppercase">
        <p>
          © {new Date().getFullYear()} {setting?.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
