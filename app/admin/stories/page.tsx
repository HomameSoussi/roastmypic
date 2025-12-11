"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Story {
  id: string;
  image_url: string;
  roast_text: string;
  roast_style: string;
  username: string | null;
  views: number;
  created_at: string;
  expires_at: string;
}

export default function AdminStories() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchStories();
  }, [page]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/content?type=stories&page=${page}&limit=${limit}`
      );

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStories(data.content);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "story", id }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Story deleted successfully");
        fetchStories();
      } else {
        alert(data.error || "Failed to delete story");
      }
    } catch (err) {
      alert("Error deleting story");
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-gray-400 hover:text-white transition-colors mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              📸 Manage Stories
            </h1>
            <p className="text-gray-400">
              Total: {total} stories • Page {page} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-white text-xl">Loading stories...</div>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stories.map((story) => {
              const isExpired = new Date(story.expires_at) < new Date();
              
              return (
                <div
                  key={story.id}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 ${
                    isExpired
                      ? "border-red-500/50 opacity-60"
                      : "border-white/20"
                  }`}
                >
                  {/* Status Badge */}
                  {isExpired && (
                    <div className="mb-4">
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                        Expired
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative w-full h-48 bg-gray-800/50 rounded-xl mb-4 overflow-hidden">
                    <img
                      src={story.image_url}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Time Remaining */}
                    <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs">
                      ⏱️ {getTimeRemaining(story.expires_at)}
                    </div>
                  </div>

                  {/* Story Text */}
                  <p className="text-white text-sm mb-4 line-clamp-2">
                    "{story.roast_text}"
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Style:</span>
                      <span className="text-white capitalize">
                        {story.roast_style.replace("_", " ")}
                      </span>
                    </div>
                    {story.username && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">User:</span>
                        <span className="text-white">{story.username}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white">{story.views}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
