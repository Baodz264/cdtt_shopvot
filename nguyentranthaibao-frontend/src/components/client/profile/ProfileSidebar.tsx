"use client";
import { Tab } from "@/app/(main)/profile/page";

interface Props {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
}

export default function ProfileSidebar({ activeTab, setActiveTab }: Props) {
  const items: { key: Tab; label: string }[] = [
    { key: "profile", label: " Hồ sơ" },
    { key: "address", label: " Địa chỉ" },
    { key: "password", label: " Đổi mật khẩu" },
    { key: "orders", label: " Đơn mua" },
  ];

  return (
    <div className="border-l pl-6">
      <h3 className="text-lg font-semibold mb-4">Danh mục</h3>

      <ul className="space-y-3 text-gray-700">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`
              cursor-pointer py-1 transition
              hover:text-blue-600
              ${activeTab === item.key ? "text-blue-600 font-semibold" : ""}
            `}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
