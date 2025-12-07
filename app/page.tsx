"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { translations, roastStyles, languages, type Language } from "@/lib/translations";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>("clean_funny");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [totalRoasts, setTotalRoasts] = useState<number>(12847); // Start with a seed number
  const [roastHistory, setRoastHistory] = useState<Array<{ roast: string; style: string; timestamp: number }>>([]);

  const t = translations[language];

  // Load roast count and history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("roastCount");
    if (stored) {
      setTotalRoasts(parseInt(stored));
    }
    
    const history = localStorage.getItem("roastHistory");
    if (history) {
      setRoastHistory(JSON.parse(history));
    }
  }, []);

  // Increment roast counter
  const incrementRoastCount = () => {
    const newCount = totalRoasts + 1;
    setTotalRoasts(newCount);
    localStorage.setItem("roastCount", newCount.toString());
  };

  // Add to roast history
  const addToHistory = (roastText: string, roastStyle: string) => {
    const newEntry = {
      roast: roastText,
      style: roastStyle,
      timestamp: Date.now()
    };
    const newHistory = [newEntry, ...roastHistory].slice(0, 5); // Keep last 5
    setRoastHistory(newHistory);
    localStorage.setItem("roastHistory", JSON.stringify(newHistory));
  };

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
      setError(t.errorUpload);
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
      incrementRoastCount();
      addToHistory(data.roast, style);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (roast) {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "RoastMyPic",
      text: `${t.shareText} https://roastmypic.vercel.app\n\n"${roast}"`,
      url: "https://roastmypic.vercel.app"
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.text);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!roast || !selectedImage) return;

    // Create canvas to render roast as image
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1f1f2e");
    gradient.addColorStop(0.5, "#7c2d8e");
    gradient.addColorStop(1, "#1f1f2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw user image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw image in center
      const imgSize = 600;
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = 100;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

      // Draw roast text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      
      // Word wrap
      const maxWidth = 900;
      const words = roast.split(" ");
      let line = "";
      let y = 780;

      words.forEach((word) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
          ctx.fillText(line, canvas.width / 2, y);
          line = word + " ";
          y += 50;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, canvas.width / 2, y);

      // Draw watermark
      ctx.font = "24px Arial";
      ctx.fillStyle = "#ec4899";
      ctx.fillText("RoastMyPic.vercel.app", canvas.width / 2, 1000);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "roastmypic.png";
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    img.src = selectedImage;
  };

  const handleTryAgain = () => {
    setSelectedImage(null);
    setImageFile(null);
    setRoast(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {t.title} 🔥
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            {t.subtitle}
          </p>
          
          {/* Language Selector */}
          <div className="flex justify-center gap-2 mb-4">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === lang.value
                    ? "bg-pink-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          {/* Roast Counter */}
          <div className="text-pink-400 text-sm animate-pulse">
            🔥 {totalRoasts.toLocaleString()} {t.totalRoasts}
          </div>
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
                        {t.uploadPrompt}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t.uploadHint}
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
                {t.chooseStyle}
              </label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {roastStyles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label[language]}
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
              {loading ? t.loadingText : t.roastButton}
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
            <div className="mt-6 space-y-4">
              <div className="p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500 rounded-lg animate-fade-in">
                <h3 className="text-xl font-bold mb-3 text-pink-400">
                  {t.yourRoast}
                </h3>
                <p className="text-lg text-white leading-relaxed mb-4">{roast}</p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {copied ? t.copiedText : t.copyButton}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {t.shareButton}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {t.downloadButton}
                  </button>
                </div>
              </div>

              {/* Try Again Button */}
              <button
                onClick={handleTryAgain}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-all"
              >
                {t.tryAgain}
              </button>
            </div>
          )}
        </div>

        {/* Roast History */}
        {roastHistory.length > 0 && !roast && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-pink-400">Recent Roasts</h3>
            <div className="space-y-3">
              {roastHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300"
                >
                  "{item.roast}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
}
