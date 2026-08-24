import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://cvrespire.vercel.app";
const DESCRIPTION =
  "Build resumes and cover letters, check ATS compatibility, and track job applications — with AI assistance.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CVRespire",
    template: "%s — CVRespire",
  },
  description: DESCRIPTION,
  keywords: [
    "resume builder",
    "AI resume",
    "cover letter generator",
    "ATS checker",
    "job application tracker",
  ],
  openGraph: {
    title: "CVRespire",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "CVRespire",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CVRespire",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "lkcrIwmpShf68DJ6B3SCdudeEI5Y07KIhapeX8k4HqI",
  },
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("cvrespire-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
