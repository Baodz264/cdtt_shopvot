"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import AuthService from "@/services/AuthService";
import { IMAGE_BASE } from "@/services/api";

const { Header } = Layout;
const { Text } = Typography;

/**
 * ✅ Avatar xác định (SSR-safe)
 * Không random, không hydration mismatch
 */
function getAvatarFromString(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 11;
  return `/avatar/avatar${index + 1}.jpg`;
}

type User = {
  name: string;
  email?: string;
  avatar?: string;
};

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  /**
   * ✅ Lấy user sau khi mount
   * Không setState vô nghĩa
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.me();
        setUser(res);
      } catch {
        message.error("Không thể lấy thông tin người dùng");
        setUser({ name: "Người dùng" });
      }
    };

    fetchUser();
  }, []);

  /**
   * ✅ Logout
   */
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      message.success("Đăng xuất thành công!");
      router.push("/login");
    } catch {
      message.error("Đăng xuất thất bại");
    }
  };

  /**
   * ✅ Menu dropdown (CHUẨN AntD)
   */
  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined /> Thông tin tài khoản
        </span>
      ),
      onClick: () => router.push("/admin/profile"),
    },
    {
      key: "settings",
      label: (
        <span className="flex items-center gap-2">
          <SettingOutlined /> Cài đặt
        </span>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <span className="flex items-center gap-2 text-red-600">
          <LogoutOutlined /> Đăng xuất
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  /**
   * ✅ Avatar source – deterministic
   */
  const avatarSrc = user?.avatar
    ? `${IMAGE_BASE}${user.avatar}`
    : user?.name
    ? getAvatarFromString(user.name)
    : undefined;

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Title */}
      <Text style={{ fontSize: 22, fontWeight: 600 }}>
        Bảng Quản Trị
      </Text>

      {/* User dropdown */}
      <Dropdown menu={{ items }} trigger={["click"]}>
        <a onClick={(e) => e.preventDefault()}>
          <Space size={12}>
            <Avatar
              size={40}
              src={avatarSrc}
              icon={!avatarSrc && <UserOutlined />}
            />
            <Text strong>{user?.name || "Người dùng"}</Text>
            <DownOutlined style={{ fontSize: 12 }} />
          </Space>
        </a>
      </Dropdown>
    </Header>
  );
}
