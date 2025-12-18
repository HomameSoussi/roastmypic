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
  const [makePublic, setMakePublic] = useState<boolean>(false);
  const [makeStory, setMakeStory] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

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
    gradient.addColorStop(0, "#ff0080");
    gradient.addColorStop(0.5, "#7928ca");
    gradient.addColorStop(1, "#ff0080");
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
      ctx.fillStyle = "#ffffff";
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
    setMakePublic(false);
    setMakeStory(false);
  };

  const handleMakePublicChange = async (checked: boolean) => {
    setMakePublic(checked);
    
    if (checked && roast && selectedImage) {
      setSubmitting(true);
      try {
        const response = await fetch("/api/roasts/public", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roastText: roast,
            roastStyle: style,
            imageUrl: selectedImage,
            language: language
          })
        });
        
        if (response.ok) {
          alert("✅ Roast added to leaderboard! Others can now vote on it.");
        } else {
          throw new Error("Failed to add to leaderboard");
        }
      } catch (err) {
        console.error("Error making roast public:", err);
        alert("❌ Failed to add to leaderboard. Please try again.");
        setMakePublic(false);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleMakeStoryChange = async (checked: boolean) => {
    setMakeStory(checked);
    
    if (checked && roast && selectedImage) {
      setSubmitting(true);
      try {
        const response = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roastText: roast,
            roastStyle: style,
            imageUrl: selectedImage,
            language: language
          })
        });
        
        if (response.ok) {
          alert("✅ Story created! It will disappear in 24 hours.");
        } else {
          throw new Error("Failed to create story");
        }
      } catch (err) {
        console.error("Error creating story:", err);
        alert("❌ Failed to create story. Please try again.");
        setMakeStory(false);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-lg">
        {/* Navigation */}
        <nav className="flex justify-center gap-4 mb-6 animate-fade-in">
          <a
            href="/leaderboard"
            className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-semibold"
          >
            🏆 {t.leaderboard}
          </a>
          <a
            href="/stories"
            className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-semibold"
          >
            📸 {t.stories}
          </a>
        </nav>

        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent drop-shadow-lg animate-slide-down">
            {t.title} 🔥
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium mb-4 animate-slide-up">
            {t.subtitle}
          </p>
          
          {/* Language Selector - Compact Pills */}
          <div className="flex justify-center gap-2 mb-4 animate-slide-up delay-100">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-110 ${
                  language === lang.value
                    ? "bg-white text-purple-600 shadow-lg scale-110"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          {/* Roast Counter */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 animate-bounce-in">
            <span className="text-2xl animate-pulse">🔥</span>
            <span className="font-bold text-sm">{totalRoasts.toLocaleString()} {t.totalRoasts}</span>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Compact Image Upload */}
            <div className="relative">
              <label
                htmlFor="image-upload"
                className="block cursor-pointer group"
              >
                {selectedImage ? (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-white/30 group-hover:border-white/60 transition-all">
                    <Image
                      src={selectedImage}
                      alt="Preview"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📸 Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-2xl border-2 border-dashed border-white/40 group-hover:border-white/70 bg-white/5 group-hover:bg-white/10 transition-all flex flex-col items-center justify-center">
                    <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                    <p className="text-white font-semibold text-lg">{t.uploadPrompt}</p>
                    <p className="text-white/70 text-sm mt-1">{t.uploadHint}</p>
                  </div>
                )}
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
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                {t.chooseStyle}
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
              >
                {roastStyles.map((s) => (
                  <option key={s.value} value={s.value} className="bg-purple-900 text-white">
                    {s.label[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!imageFile || loading}
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-black py-4 px-6 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 text-lg"
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
            <div className="mt-4 p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm animate-shake">
              <p className="text-white text-center font-medium">{error}</p>
            </div>
          )}

          {/* Result Box */}
          {roast && (
            <div className="mt-6 space-y-4 animate-slide-up">
              <div className="p-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-white/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl animate-bounce">🔥</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{t.yourRoast}</h3>
                    <p className="text-white text-lg leading-relaxed">{roast}</p>
                  </div>
                </div>
                
                {/* Make Public Options */}
                <div className="mb-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="makePublic"
                      checked={makePublic}
                      onChange={(e) => handleMakePublicChange(e.target.checked)}
                      disabled={submitting}
                      className="mt-1 w-5 h-5 rounded border-2 border-white/50 bg-white/10 checked:bg-pink-500 focus:ring-2 focus:ring-pink-500 cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-pink-200 transition-colors">
                        🏆 {t.makePublic}
                      </div>
                      <div className="text-sm text-white/70">
                        {t.makePublicHint}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="makeStory"
                      checked={makeStory}
                      onChange={(e) => handleMakeStoryChange(e.target.checked)}
                      disabled={submitting}
                      className="mt-1 w-5 h-5 rounded border-2 border-white/50 bg-white/10 checked:bg-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        📸 Share as 24h Story
                      </div>
                      <div className="text-sm text-white/70">
                        Disappears after 24 hours
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-3 rounded-xl transition-all font-semibold border border-white/30"
                  >
                    {copied ? "✓ " + t.copiedText : "📋 " + t.copyButton}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl transition-all font-semibold"
                  >
                    📤 {t.shareButton}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-green-500/80 hover:bg-green-600/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl transition-all font-semibold"
                  >
                    💾 {t.downloadButton}
                  </button>
                  <button
                    onClick={handleTryAgain}
                    className="bg-purple-500/80 hover:bg-purple-600/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl transition-all font-semibold"
                  >
                    🔄 {t.tryAgain}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Roast History */}
        {roastHistory.length > 0 && !roast && (
          <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🕐</span> Recent Roasts
            </h3>
            <div className="space-y-3">
              {roastHistory.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-sm text-white/90 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                >
                  "{item.roast}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-white/70 text-sm animate-fade-in">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
}
