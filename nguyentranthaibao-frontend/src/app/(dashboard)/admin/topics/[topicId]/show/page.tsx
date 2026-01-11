"use client";

import { useParams } from "next/navigation";

type Topic = {
  id: number;
  name: string;
  slug: string;
  status: number;
};

export default function ShowTopicPage() {
  const { topicId } = useParams();

  // Mock data
  const topic: Topic = {
    id: Number(topicId),
    name: "Tin tức",
    slug: "tin-tuc",
    status: 1,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết Topic</h1>
      <p>
        <strong>ID:</strong> {topic.id}
      </p>
      <p>
        <strong>Tên:</strong> {topic.name}
      </p>
      <p>
        <strong>Slug:</strong> {topic.slug}
      </p>
      <p>
        <strong>Trạng thái:</strong> {topic.status ? "Hiển thị" : "Ẩn"}
      </p>
    </div>
  );
}
