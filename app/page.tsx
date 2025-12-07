"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

const ROAST_STYLES = [
  { value: "moroccan_savage", label: "🇲🇦 Moroccan Savage (Darija)" },
  { value: "clean_funny", label: "😊 Clean & Funny" },
  { value: "dark_humor", label: "😈 Dark Humor" },
  { value: "flirty", label: "😏 Flirty" },
  { value: "corporate", label: "💼 Corporate Sarcasm" },
  { value: "muslim_friendly", label: "☪️ Muslim Friendly" }
];

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>("clean_funny");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRoast(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError("Please upload an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setRoast(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("style", style);

      const response = await fetch("/api/roast", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roast");
      }

      setRoast(data.roast);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            RoastMyPic 🔥
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your photo and get roasted by AI
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="mb-6">
              <label
                htmlFor="image-upload"
                className="block text-center cursor-pointer"
              >
                <div className="border-2 border-dashed border-pink-500 rounded-xl p-8 hover:border-pink-400 transition-colors">
                  {selectedImage ? (
                    <div className="relative w-full h-64">
                      <Image
                        src={selectedImage}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-pink-500 mb-4"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-lg text-gray-300 mb-2">
                        Click to upload your photo
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Style Selector */}
            <div className="mb-6">
              <label
                htmlFor="style-select"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Choose your roast style
              </label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {ROAST_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!imageFile || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? "🔥 Cooking your roast..." : "Roast Me 🔥"}
            </button>
          </form>

          {/* Error State */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Result Box */}
          {roast && (
            <div className="mt-6 p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500 rounded-lg animate-fade-in">
              <h3 className="text-xl font-bold mb-3 text-pink-400">
                Your Roast:
              </h3>
              <p className="text-lg text-white leading-relaxed">{roast}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Made with 🔥 by RoastMaster9000</p>
        </footer>
      </div>
    </div>
  );
}
