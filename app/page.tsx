'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { translations, roastStyles, languages, type Language } from "@/lib/translations";
import { useSettings, getSetting } from "@/hooks/useSettings";

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  
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

  // Get dynamic settings with fallbacks
  const headline = getSetting(settings, 'landing_page_headline', { text: t.title })?.text || t.title;
  const subheadline = getSetting(settings, 'landing_page_subheadline', { text: t.subtitle })?.text || t.subtitle;
  const ctaButton = getSetting(settings, 'landing_page_cta_button', { text: t.roastButton })?.text || t.roastButton;
  const announcementBanner = getSetting(settings, 'announcement_banner', null);
  const primaryColor = getSetting(settings, 'primary_color', { hex: '#F472B6' })?.hex || '#F472B6';
  const bgGradientStart = getSetting(settings, 'background_gradient_start', { hex: '#1D243A' })?.hex || '#1D243A';
  const bgGradientEnd = getSetting(settings, 'background_gradient_end', { hex: '#0F172A' })?.hex || '#0F172A';
  const enableLeaderboard = getSetting(settings, 'enable_leaderboard', { enabled: true })?.enabled !== false;
  const enableStories = getSetting(settings, 'enable_stories', { enabled: true })?.enabled !== false;
  const enableVoting = getSetting(settings, 'enable_voting', { enabled: true })?.enabled !== false;
  const dynamicRoastStyles = getSetting(settings, 'roast_styles', roastStyles);
  const defaultMakePublic = getSetting(settings, 'default_make_public', { enabled: false })?.enabled || false;
  const defaultShareStory = getSetting(settings, 'default_share_story', { enabled: false })?.enabled || false;

  useEffect(() => {
    const stored = localStorage.getItem("roastCount");
    if (stored) setTotalRoasts(parseInt(stored));
    
    const history = localStorage.getItem("roastHistory");
    if (history) setRoastHistory(JSON.parse(history));
    
    // Set default checkbox states from settings
    setMakePublic(defaultMakePublic);
    setMakeStory(defaultShareStory);
  }, [defaultMakePublic, defaultShareStory]);

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
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(0.5, "#7928ca");
    gradient.addColorStop(1, primaryColor);
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
    setMakePublic(defaultMakePublic);
    setMakeStory(defaultShareStory);
  };

  const handleMakePublicChange = async (checked: boolean) => {
    if (!enableVoting) return; // Don't allow if voting is disabled
    
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
    if (!enableStories) return; // Don't allow if stories are disabled
    
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

  // Get active roast styles from dynamic settings
  const activeRoastStyles = Array.isArray(dynamicRoastStyles) 
    ? dynamicRoastStyles.filter((s: any) => s.is_active !== false)
    : roastStyles;

  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${bgGradientStart}, ${bgGradientEnd})`
      }}
    >
      {/* Announcement Banner */}
      {announcementBanner && announcementBanner.text && (
        <div 
          className="w-full py-3 text-center font-semibold text-white"
          style={{ backgroundColor: announcementBanner.color || primaryColor }}
        >
          {announcementBanner.link ? (
            <a href={announcementBanner.link} className="hover:underline">
              {announcementBanner.text}
            </a>
          ) : (
            announcementBanner.text
          )}
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}33` }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ backgroundColor: `${primaryColor}33` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse delay-2000"
          style={{ backgroundColor: `${primaryColor}33` }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-lg">
        {/* Navigation */}
        <nav className="flex justify-center gap-4 mb-6 animate-fade-in">
          {enableLeaderboard && (
            <a
              href="/leaderboard"
              className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-semibold"
            >
              🏆 {t.leaderboard}
            </a>
          )}
          {enableStories && (
            <a
              href="/stories"
              className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-semibold"
            >
              📸 {t.stories}
            </a>
          )}
        </nav>

        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent drop-shadow-lg animate-slide-down">
            {headline} 🔥
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium mb-4 animate-slide-up">
            {subheadline}
          </p>
          
          {/* Language Selector - Compact Pills */}
          <div className="flex justify-center gap-2 mb-4 animate-slide-up delay-100">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-110 ${
                  language === lang.value
                    ? "bg-white shadow-lg scale-110"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
                style={language === lang.value ? { color: primaryColor } : {}}
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
            {/* Image Upload */}
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
              <label className="block text-sm font-semibold mb-2">{t.chooseStyle}</label>
              <div className="grid grid-cols-2 gap-2">
                {activeRoastStyles.map((roastStyle: any) => {
                  const styleKey = typeof roastStyle === 'string' ? roastStyle : roastStyle.name;
                  const styleName = typeof roastStyle === 'string' 
                    ? roastStyles.find(s => s.value === roastStyle)?.label || styleKey
                    : roastStyle.name;
                  const badgeColor = typeof roastStyle === 'object' && roastStyle.badge_color 
                    ? roastStyle.badge_color 
                    : primaryColor;
                  
                  return (
                    <button
                      key={styleKey}
                      type="button"
                      onClick={() => setStyle(styleKey)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                        style === styleKey
                          ? "shadow-lg scale-105"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      style={
                        style === styleKey
                          ? { backgroundColor: badgeColor, color: 'white' }
                          : {}
                      }
                    >
                      {styleName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!imageFile || loading}
              className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? t.loading : ctaButton}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 animate-shake">
              ❌ {error}
            </div>
          )}

          {/* Roast Result */}
          {roast && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-lg leading-relaxed">{roast}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                >
                  🔗 Share
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                >
                  💾 Download
                </button>
                <button
                  onClick={handleTryAgain}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                >
                  🔄 Try Again
                </button>
              </div>

              {/* Public/Story Checkboxes */}
              <div className="space-y-3">
                {enableVoting && (
                  <label className="flex items-center gap-3 p-4 bg-white/10 rounded-xl cursor-pointer hover:bg-white/15 transition-all">
                    <input
                      type="checkbox"
                      checked={makePublic}
                      onChange={(e) => handleMakePublicChange(e.target.checked)}
                      disabled={submitting}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-semibold">🏆 Make Public (Leaderboard)</span>
                  </label>
                )}
                {enableStories && (
                  <label className="flex items-center gap-3 p-4 bg-white/10 rounded-xl cursor-pointer hover:bg-white/15 transition-all">
                    <input
                      type="checkbox"
                      checked={makeStory}
                      onChange={(e) => handleMakeStoryChange(e.target.checked)}
                      disabled={submitting}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-semibold">📸 Share as 24h Story</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
