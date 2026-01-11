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

export default function Footer() {
  const [setting, setSetting] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await SettingService.list({ limit: 1 });
        if (res.data && res.data.length > 0) {
          setSetting(res.data[0]);
        }
      } catch (error) {
        console.error("Lỗi lấy setting:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSetting();
  }, []);

  // Skeleton loading để giao diện không bị giật
  if (loading) {
    return (
      <footer className="bg-slate-900 py-12 animate-pulse">
        <div className="container mx-auto px-4 h-32 bg-slate-800 rounded-lg"></div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0f172a] text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* CỘT 1: THƯƠNG HIỆU */}
        <div className="space-y-4">
          <h3 className="text-white text-2xl font-black tracking-tight italic">
            {setting?.name?.toUpperCase() || "SHOPVOT"}<span className="text-orange-500">.</span>
          </h3>
          <p className="leading-relaxed text-sm">
            Nâng tầm những cú đập cầu của bạn. Chúng tôi cung cấp các dòng vợt chuyên nghiệp nhất cho mọi vận động viên.
          </p>
          <div className="flex space-x-3 pt-2">
            {[ 
              { icon: <FaFacebookF />, color: "hover:bg-blue-600", href: "https://www.facebook.com/bao.nguyen.58179?locale=vi_VN" },
              { icon: <FaInstagram />, color: "hover:bg-pink-600", href: "#" },
              { icon: <FaYoutube />, color: "hover:bg-red-600", href: "#" },
              { icon: <FaTwitter />, color: "hover:bg-sky-500", href: "#" }
            ].map((social, idx) => (
              <a 
                key={idx} 
                href={social.href} 
                className={`w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white transition-all duration-300 ${social.color}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* CỘT 2: LIÊN HỆ (Sử dụng icon cho trực quan) */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Thông tin liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-orange-500 mt-1 shrink-0" />
              <span>{setting?.address || "Địa chỉ chưa cập nhật"}</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-orange-500 shrink-0" />
              <span className="font-medium text-slate-200">{setting?.hotline || setting?.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-orange-500 shrink-0" />
              <span>{setting?.email}</span>
            </li>
            <li className="flex items-center gap-3 text-xs text-slate-500 border-t border-slate-800 pt-3 mt-3">
              <FaClock />
              <span>8:00 - 20:00 (Thứ 2 - CN)</span>
            </li>
          </ul>
        </div>

        {/* CỘT 3: CHÍNH SÁCH */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Chính sách & Hỗ trợ</h4>
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {[
              { label: "Giới thiệu", href: "/about" },
              { label: "Chính sách bảo mật", href: "/privacy" },
              { label: "Vận chuyển", href: "/shipping" },
              { label: "Điều khoản", href: "/terms" },
              { label: "Hướng dẫn chọn vợt", href: "/guide" },
              { label: "Câu hỏi thường gặp", href: "/faq" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-orange-400 transition-colors flex items-center group">
                  <span className="w-0 group-hover:w-2 h-[1px] bg-orange-400 mr-0 group-hover:mr-2 transition-all"></span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CỘT 4: NEWSLETTER (Tăng tính chuyên nghiệp) */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Đăng ký nhận tin</h4>
          <p className="text-sm">Nhận thông báo về các mẫu vợt mới nhất và khuyến mãi.</p>
          <div className="flex flex-col gap-2">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="bg-slate-800 border-none rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-md transition-colors text-sm">
              ĐĂNG KÝ NGAY
            </button>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wider uppercase">
        <p>© {new Date().getFullYear()} {setting?.name || "ShopVot"}. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
          <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}