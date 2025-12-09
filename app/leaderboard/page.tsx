"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, type Language } from "@/lib/translations";

interface PublicRoast {
  id: string;
  image_url: string;
  roast_text: string;
  roast_style: string;
  language: string;
  votes: number;
  created_at: string;
  has_voted?: boolean;
}

export default function Leaderboard() {
  const [language, setLanguage] = useState<Language>("en");
  const [roasts, setRoasts] = useState<PublicRoast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/roasts/public");
      const data = await response.json();
      
      if (data.success) {
        setRoasts(data.roasts);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (err) {
      setError("Error loading leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (roastId: string) => {
    try {
      const response = await fetch("/api/roasts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roastId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh leaderboard
        fetchLeaderboard();
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="text-white hover:text-pink-200 transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>

          {/* Language Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === "en"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              🇬🇧
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === "fr"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              🇫🇷
            </button>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === "ar"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              🇲🇦
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🏆 {t.leaderboard || "Leaderboard"}
          </h1>
          <p className="text-xl text-white/90">
            {t.leaderboardSubtitle || "Vote for the funniest roasts!"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            <p className="text-white mt-4 text-lg">Loading roasts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 text-center">
            <p className="text-white text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && roasts.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t.noRoastsYet || "No roasts yet!"}
            </h2>
            <p className="text-white/80 mb-6">
              {t.beTheFirst || "Be the first to share your roast with the world!"}
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              {t.createRoast || "Create a Roast 🔥"}
            </Link>
          </div>
        )}

        {/* Roasts Grid */}
        {!loading && !error && roasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roasts.map((roast, index) => (
              <div
                key={roast.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                {/* Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                )}

                {/* Image */}
                <div className="relative w-full h-48 bg-gray-800/50 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={roast.image_url}
                    alt="Roasted"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Roast Text */}
                <p className="text-white text-lg mb-4 line-clamp-3">
                  "{roast.roast_text}"
                </p>

                {/* Style Badge */}
                <div className="inline-block bg-purple-500/30 px-3 py-1 rounded-full text-white text-sm mb-4">
                  {roast.roast_style.replace("_", " ")}
                </div>

                {/* Vote Button */}
                <button
                  onClick={() => handleVote(roast.id)}
                  disabled={roast.has_voted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    roast.has_voted
                      ? "bg-gray-500/50 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105"
                  }`}
                >
                  {roast.has_voted ? "✓ Voted" : "🔥 Vote"} ({roast.votes})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
