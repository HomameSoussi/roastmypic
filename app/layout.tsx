import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoastMyPic 🔥 - Get Roasted by AI",
  description: "Upload your photo and get hilariously roasted by AI in multiple languages and styles. Moroccan Darija, English, French - all styles available!",
  keywords: ["roast", "AI", "photo", "funny", "humor", "Moroccan", "Darija", "viral"],
  authors: [{ name: "RoastMaster9000" }],
  openGraph: {
    title: "RoastMyPic 🔥 - Get Roasted by AI",
    description: "Upload your photo and get hilariously roasted by AI! Try it now!",
    url: "https://roastmypic.vercel.app",
    siteName: "RoastMyPic",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RoastMyPic - AI Photo Roasting"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastMyPic 🔥 - Get Roasted by AI",
    description: "Upload your photo and get hilariously roasted by AI!",
    images: ["/og-image.png"]
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ec4899"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
