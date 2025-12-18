"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalRoasts: number;
  totalVotes: number;
  totalStories: number;
  totalStoryViews: number;
  roastsByStyle: Array<{ roast_style: string; count: string }>;
  topRoasts: Array<any>;
  recentRoasts: Array<any>;
  roastsPerDay: Array<{ date: string; count: string }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to load stats");
      }
    } catch (err) {
      setError("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || "Failed to load"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎛️ Admin Dashboard
            </h1>
            <p className="text-gray-400">RoastMyPic Platform Management</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              🏠 Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Roasts */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500/30">
          <div className="text-blue-400 text-sm font-medium mb-2">
            TOTAL ROASTS
          </div>
          <div className="text-white text-4xl font-bold mb-2">
            {stats.totalRoasts}
          </div>
          <div className="text-blue-300 text-sm">Public roasts submitted</div>
        </div>

        {/* Total Votes */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-green-500/30">
          <div className="text-green-400 text-sm font-medium mb-2">
            TOTAL VOTES
          </div>
          <div className="text-white text-4xl font-bold mb-2">
            {stats.totalVotes}
          </div>
          <div className="text-green-300 text-sm">Community engagement</div>
        </div>

        {/* Total Stories */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-500/30">
          <div className="text-purple-400 text-sm font-medium mb-2">
            ACTIVE STORIES
          </div>
          <div className="text-white text-4xl font-bold mb-2">
            {stats.totalStories}
          </div>
          <div className="text-purple-300 text-sm">24-hour stories</div>
        </div>

        {/* Total Story Views */}
        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-pink-500/30">
          <div className="text-pink-400 text-sm font-medium mb-2">
            STORY VIEWS
          </div>
          <div className="text-white text-4xl font-bold mb-2">
            {stats.totalStoryViews}
          </div>
          <div className="text-pink-300 text-sm">Total story views</div>
        </div>
      </div>

      {/* Content Management Links */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/roasts"
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all border-2 border-white/20 hover:border-white/40"
        >
          <div className="text-4xl mb-4">🔥</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Manage Roasts
          </h3>
          <p className="text-gray-400">
            View, moderate, and delete public roasts
          </p>
        </Link>

        <Link
          href="/admin/stories"
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all border-2 border-white/20 hover:border-white/40"
        >
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Manage Stories
          </h3>
          <p className="text-gray-400">
            View, moderate, and delete 24h stories
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 hover:from-pink-500/30 hover:to-purple-500/30 transition-all border-2 border-pink-500/40 hover:border-pink-500/60"
        >
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Platform Settings
          </h3>
          <p className="text-gray-400">
            Control all platform features without code
          </p>
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-8 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all border-2 border-blue-500/40 hover:border-blue-500/60"
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Analytics Dashboard
          </h3>
          <p className="text-gray-400">
            Track platform usage and user behavior
          </p>
        </Link>
      </div>

      {/* Roasts by Style */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            📊 Roasts by Style
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.roastsByStyle.map((item) => (
              <div
                key={item.roast_style}
                className="bg-white/5 rounded-xl p-4 text-center"
              >
                <div className="text-white text-2xl font-bold mb-1">
                  {item.count}
                </div>
                <div className="text-gray-400 text-sm capitalize">
                  {item.roast_style.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Roasts */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            🏆 Top Roasts
          </h3>
          <div className="space-y-3">
            {stats.topRoasts.slice(0, 5).map((roast, index) => (
              <div
                key={roast.id}
                className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-white line-clamp-1">
                      {roast.roast_text}
                    </p>
                    <p className="text-gray-400 text-sm capitalize">
                      {roast.roast_style.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-white font-bold">
                  {roast.votes} votes
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            📅 Recent Roasts
          </h3>
          <div className="space-y-3">
            {stats.recentRoasts.slice(0, 5).map((roast) => (
              <div
                key={roast.id}
                className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white line-clamp-1">
                    {roast.roast_text}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(roast.created_at).toLocaleString()} • {roast.votes} votes
                  </p>
                </div>
                <div className="text-gray-400 capitalize text-sm">
                  {roast.roast_style.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
