"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, type Language } from "@/lib/translations";

interface Story {
  id: string;
  image_url: string;
  roast_text: string;
  roast_style: string;
  username: string | null;
  views: number;
  created_at: string;
  expires_at: string;
  reaction_count: number;
}

export default function Stories() {
  const [language, setLanguage] = useState<Language>("en");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const t = translations[language];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stories");
      const data = await response.json();
      
      if (data.success) {
        setStories(data.stories);
      } else {
        setError("Failed to load stories");
      }
    } catch (err) {
      setError("Error loading stories");
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (storyId: string, emoji: string) => {
    try {
      await fetch(`/api/stories/${storyId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      
      // Refresh stories
      fetchStories();
    } catch (err) {
      console.error("Error reacting:", err);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
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
            📸 {t.stories || "Stories"}
          </h1>
          <p className="text-xl text-white/90">
            {t.storiesSubtitle || "24-hour roast stories from the community"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            <p className="text-white mt-4 text-lg">Loading stories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 text-center">
            <p className="text-white text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t.noStories || "No stories yet!"}
            </h2>
            <p className="text-white/80 mb-6">
              {t.shareYourStory || "Share your roast story with the community!"}
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              {t.createStory || "Create a Story 🔥"}
            </Link>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && !error && stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                {/* Story Image */}
                <div className="relative w-full h-64 bg-gray-800/50">
                  <img
                    src={story.image_url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Time Remaining Overlay */}
                  <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs">
                    ⏱️ {getTimeRemaining(story.expires_at)}
                  </div>
                  
                  {/* Username Overlay */}
                  {story.username && (
                    <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                      {story.username}
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="p-4">
                  <p className="text-white text-sm mb-3 line-clamp-2">
                    "{story.roast_text}"
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-white/70 text-xs">
                    <span>👁️ {story.views} views</span>
                    <span>🔥 {story.reaction_count} reactions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="max-w-2xl w-full bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition-transform z-10"
            >
              ×
            </button>

            {/* Story Image */}
            <div className="relative w-full h-96 bg-gray-900">
              <img
                src={selectedStory.image_url}
                alt="Story"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Story Content */}
            <div className="p-6">
              <p className="text-white text-xl mb-4">
                "{selectedStory.roast_text}"
              </p>
              
              {/* Reactions */}
              <div className="flex gap-3 mb-4">
                {["🔥", "💀", "😂", "😈", "😱"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(selectedStory.id, emoji)}
                    className="text-3xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-white/70">
                <span>👁️ {selectedStory.views} views</span>
                <span>🔥 {selectedStory.reaction_count} reactions</span>
                <span>⏱️ {getTimeRemaining(selectedStory.expires_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
