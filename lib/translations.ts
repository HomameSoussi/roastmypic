/**
 * Internationalization (i18n) translations
 * Supports English, French, and Arabic (Darija)
 */

export type Language = "en" | "fr" | "ar";

export interface Translations {
  title: string;
  subtitle: string;
  uploadPrompt: string;
  uploadHint: string;
  chooseStyle: string;
  chooseLanguage: string;
  roastButton: string;
  loadingText: string;
  yourRoast: string;
  shareButton: string;
  downloadButton: string;
  tryAgain: string;
  copyButton: string;
  copiedText: string;
  totalRoasts: string;
  footer: string;
  shareText: string;
  errorUpload: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    title: "RoastMyPic",
    subtitle: "Upload your photo and get roasted by AI",
    uploadPrompt: "Click to upload your photo",
    uploadHint: "PNG, JPG, GIF up to 5MB",
    chooseStyle: "Choose your roast style",
    chooseLanguage: "Interface Language",
    roastButton: "Roast Me 🔥",
    loadingText: "🔥 Cooking your roast...",
    yourRoast: "Your Roast:",
    shareButton: "Share",
    downloadButton: "Download",
    tryAgain: "Try Another Photo",
    copyButton: "Copy",
    copiedText: "Copied!",
    totalRoasts: "roasts generated worldwide",
    footer: "Made with 🔥 by RoastMaster9000",
    shareText: "I just got roasted by AI! 🔥 Try it yourself at",
    errorUpload: "Please upload an image first"
  },
  fr: {
    title: "RoastMyPic",
    subtitle: "Téléchargez votre photo et faites-vous griller par l'IA",
    uploadPrompt: "Cliquez pour télécharger votre photo",
    uploadHint: "PNG, JPG, GIF jusqu'à 5 Mo",
    chooseStyle: "Choisissez votre style de roast",
    chooseLanguage: "Langue de l'interface",
    roastButton: "Grille-moi 🔥",
    loadingText: "🔥 Préparation de votre roast...",
    yourRoast: "Votre Roast:",
    shareButton: "Partager",
    downloadButton: "Télécharger",
    tryAgain: "Essayer une autre photo",
    copyButton: "Copier",
    copiedText: "Copié!",
    totalRoasts: "roasts générés dans le monde",
    footer: "Fait avec 🔥 par RoastMaster9000",
    shareText: "Je viens de me faire griller par l'IA! 🔥 Essayez-le à",
    errorUpload: "Veuillez d'abord télécharger une image"
  },
  ar: {
    title: "RoastMyPic",
    subtitle: "حمّل صورتك وخلي الذكاء الاصطناعي يشعلك",
    uploadPrompt: "كليكي باش تحمّل الصورة ديالك",
    uploadHint: "PNG, JPG, GIF حتى 5 ميغا",
    chooseStyle: "اختار نوع الروست",
    chooseLanguage: "لغة الواجهة",
    roastButton: "شعلني 🔥",
    loadingText: "🔥 كنحضّر الروست ديالك...",
    yourRoast: "الروست ديالك:",
    shareButton: "شارك",
    downloadButton: "حمّل",
    tryAgain: "جرّب صورة أخرى",
    copyButton: "نسخ",
    copiedText: "تنسخ!",
    totalRoasts: "روست تولد فالعالم كامل",
    footer: "صنع ب 🔥 من طرف RoastMaster9000",
    shareText: "أنا تشعلت من الذكاء الاصطناعي! 🔥 جربها نتا فـ",
    errorUpload: "خصك تحمّل صورة أولاً"
  }
};

export const roastStyles = [
  { value: "moroccan_savage", label: { en: "🇲🇦 Moroccan Savage (Darija)", fr: "🇲🇦 Sauvage Marocain (Darija)", ar: "🇲🇦 المغربي المتوحش (دارجة)" } },
  { value: "clean_funny", label: { en: "😊 Clean & Funny", fr: "😊 Propre et Drôle", ar: "😊 نظيف ومضحك" } },
  { value: "dark_humor", label: { en: "😈 Dark Humor", fr: "😈 Humour Noir", ar: "😈 فكاهة سوداء" } },
  { value: "flirty", label: { en: "😏 Flirty", fr: "😏 Séducteur", ar: "😏 غزّال" } },
  { value: "corporate", label: { en: "💼 Corporate Sarcasm", fr: "💼 Sarcasme Corporate", ar: "💼 سخرية مهنية" } },
  { value: "muslim_friendly", label: { en: "☪️ Muslim Friendly", fr: "☪️ Musulman Friendly", ar: "☪️ حلال" } }
];

export const languages: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "ar", label: "العربية", flag: "🇲🇦" }
];
