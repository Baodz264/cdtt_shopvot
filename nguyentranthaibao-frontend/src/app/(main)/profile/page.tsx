"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import ProfileSidebar from "@/components/client/profile/ProfileSidebar";
import ProfileAvatar from "@/components/client/profile/ProfileAvatar";
import ProfileInfo from "@/components/client/profile/ProfileInfo";
import ProfileAddress from "@/components/client/profile/ProfileAddress";
import ProfilePassword from "@/components/client/profile/ProfilePassword";
import ProfileOrders from "@/components/client/profile/ProfileOrders";

export type Tab = "profile" | "address" | "password" | "orders";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { user, loading } = useAuth();

  if (loading) return <p>Đang tải...</p>;
  if (!user) return <p>Vui lòng đăng nhập</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_180px] gap-6">
        <ProfileAvatar user={user} />
        <div>
          {activeTab === "profile" && <ProfileInfo user={user} />}
          {activeTab === "address" && <ProfileAddress />}
          {activeTab === "password" && <ProfilePassword />}
          {activeTab === "orders" && <ProfileOrders />}
        </div>
        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
