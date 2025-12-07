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
  makePublic: string;
  makePublicHint: string;
  leaderboard: string;
  leaderboardSubtitle: string;
  stories: string;
  storiesSubtitle: string;
  noRoastsYet: string;
  beTheFirst: string;
  createRoast: string;
  noStories: string;
  shareYourStory: string;
  createStory: string;
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
    errorUpload: "Please upload an image first",
    makePublic: "Make this roast public",
    makePublicHint: "Share with the community and compete on the leaderboard!",
    leaderboard: "Leaderboard",
    leaderboardSubtitle: "Vote for the funniest roasts!",
    stories: "Stories",
    storiesSubtitle: "24-hour roast stories from the community",
    noRoastsYet: "No roasts yet!",
    beTheFirst: "Be the first to share your roast with the world!",
    createRoast: "Create a Roast",
    noStories: "No stories yet!",
    shareYourStory: "Share your roast story with the community!",
    createStory: "Create a Story"
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
    errorUpload: "Veuillez d'abord télécharger une image",
    makePublic: "Rendre ce roast public",
    makePublicHint: "Partagez avec la communauté et participez au classement!",
    leaderboard: "Classement",
    leaderboardSubtitle: "Votez pour les roasts les plus drôles!",
    stories: "Stories",
    storiesSubtitle: "Stories de roast de 24 heures de la communauté",
    noRoastsYet: "Pas encore de roasts!",
    beTheFirst: "Soyez le premier à partager votre roast avec le monde!",
    createRoast: "Créer un Roast",
    noStories: "Pas encore de stories!",
    shareYourStory: "Partagez votre story de roast avec la communauté!",
    createStory: "Créer une Story"
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
    errorUpload: "خصك تحمّل صورة أولاً",
    makePublic: "اجعل هذا الروست عام",
    makePublicHint: "شارك مع المجتمع وتنافس في الترتيب!",
    leaderboard: "الترتيب",
    leaderboardSubtitle: "صوّت على أفضل الروستات!",
    stories: "القصص",
    storiesSubtitle: "قصص روست 24 ساعة من المجتمع",
    noRoastsYet: "ما كاينش روست بعد!",
    beTheFirst: "كون نتا الأول لي يشارك الروست ديالو مع العالم!",
    createRoast: "اصنع روست",
    noStories: "ما كاينش قصص بعد!",
    shareYourStory: "شارك قصة الروست ديالك مع المجتمع!",
    createStory: "اصنع قصة"
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
