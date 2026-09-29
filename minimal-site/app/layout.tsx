import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "minimal — 必要なものだけで、毎日を整える。",
  description:
    "minimalは、日常にある「必要以上のもの」を減らし、本当に必要なものだけを残すブランドです。minimal Schedule、minimal Todo、minimal Financeを開発しています。",
  metadataBase: new URL("https://minimal.example.com"),
  openGraph: {
    title: "minimal",
    description: "必要なものだけで、毎日を整える。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
