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
  const [totalRoasts, setTotalRoasts] = useState<number>(12847);
  const [roastHistory, setRoastHistory] = useState<Array<{ roast: string; style: string; timestamp: number }>>([]);

  const t = translations[language];

  useEffect(() => {
    const stored = localStorage.getItem("roastCount");
    if (stored) setTotalRoasts(parseInt(stored));
    
    const history = localStorage.getItem("roastHistory");
    if (history) setRoastHistory(JSON.parse(history));
  }, []);

  const incrementRoastCount = () => {
    const newCount = totalRoasts + 1;
    setTotalRoasts(newCount);
    localStorage.setItem("roastCount", newCount.toString());
  };

  const addToHistory = (roastText: string, roastStyle: string) => {
    const newEntry = { roast: roastText, style: roastStyle, timestamp: Date.now() };
    const newHistory = [newEntry, ...roastHistory].slice(0, 5);
    setRoastHistory(newHistory);
    localStorage.setItem("roastHistory", JSON.stringify(newHistory));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
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
      await navigator.clipboard.writeText(shareData.text);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!roast || !selectedImage) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1f1f2e");
    gradient.addColorStop(0.5, "#7c2d8e");
    gradient.addColorStop(1, "#1f1f2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgSize = 600;
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = 100;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      
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

      ctx.font = "24px Arial";
      ctx.fillStyle = "#ec4899";
      ctx.fillText("RoastMyPic.vercel.app", canvas.width / 2, 1000);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-x-hidden">
      {/* Compact Sticky Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-pink-500/20 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                RoastMyPic 🔥
              </h1>
              <div className="hidden md:flex items-center gap-2 text-xs text-pink-400 animate-pulse">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                {totalRoasts.toLocaleString()} roasts
              </div>
            </div>
            
            {/* Compact Language Selector */}
            <div className="flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-2 py-1 text-sm rounded transition-all ${
                    language === lang.value
                      ? "bg-pink-500 text-white scale-110"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-600"
                  }`}
                  title={lang.label}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Two Column Layout on Desktop */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Compact Image Upload */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <label htmlFor="image-upload" className="block cursor-pointer group">
                  <div className="relative aspect-square">
                    {selectedImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={selectedImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold text-lg">📸 Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-2 border-dashed border-pink-500/50 group-hover:border-pink-500 transition-all group-hover:scale-[1.02]">
                        <svg className="w-20 h-20 text-pink-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white font-bold text-lg mb-2">📸 Upload Photo</p>
                        <p className="text-gray-400 text-sm">PNG, JPG, GIF • Max 5MB</p>
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

              {/* Compact Style Selector */}
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              >
                {roastStyles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label[language]}
                  </option>
                ))}
              </select>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!imageFile || loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    {t.loadingText}
                  </span>
                ) : (
                  t.roastButton
                )}
              </button>
            </form>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg shake">
                <p className="text-red-300 text-center text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results & History */}
          <div className="space-y-4">
            {/* Result Box */}
            {roast && (
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500 rounded-xl p-6 animate-bounce-in shadow-2xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">🔥</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-pink-400 mb-2">{t.yourRoast}</h3>
                    <p className="text-white text-lg leading-relaxed">{roast}</p>
                  </div>
                </div>
                
                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleCopy}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    {copied ? "✓ " + t.copiedText : "📋 " + t.copyButton}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    📤 {t.shareButton}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    💾 {t.downloadButton}
                  </button>
                  <button
                    onClick={handleTryAgain}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    🔄 {t.tryAgain}
                  </button>
                </div>
              </div>
            )}

            {/* Roast History - Compact */}
            {roastHistory.length > 0 && !roast && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 shadow-xl">
                <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🕐</span> Recent Roasts
                </h3>
                <div className="space-y-2">
                  {roastHistory.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700/30 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 transition-colors cursor-pointer line-clamp-2"
                      title={item.roast}
                    >
                      "{item.roast}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action when idle */}
            {!roast && !selectedImage && (
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-2 border-pink-500/30 rounded-xl p-8 text-center shadow-xl">
                <div className="text-6xl mb-4 animate-bounce">🔥</div>
                <h2 className="text-2xl font-bold text-white mb-3">{t.subtitle}</h2>
                <p className="text-gray-400 text-base mb-4">
                  Upload a photo and get roasted in seconds!
                </p>
                <div className="flex items-center justify-center gap-2 text-pink-400 text-sm">
                  <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                  {totalRoasts.toLocaleString()} {t.totalRoasts}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-xs">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
}
