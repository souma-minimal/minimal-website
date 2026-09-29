import type { Config } from "tailwindcss";

// ── minimal デザインシステム ─────────────────────────────
// すべての色・余白・タイポグラフィはここで一元管理する。
// ページごとに数値をバラバラに書かない。
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: "#121212",
        void: "#0A0A0A", // ダークセクションの背景
        mist: "#F4F4F2", // ごく淡いセクション区切り
        line: "#E6E6E3", // ヘアライン
        graphite: "#8A8A87", // 補助テキスト
        accent: {
          schedule: "#3652FF",
          todo: "#9C7817",
          finance: "#1C8F6E",
        },
      },
      fontFamily: {
        display: [
          '"Space Grotesk"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Yu Gothic Medium",
          "Yu Gothic",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["SF Mono", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        // タイポグラフィスケール（少数の跳躍で構成する）
        "display-1": ["clamp(2.75rem, 8vw, 7rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-2": ["clamp(2rem, 5vw, 4rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-3": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        body: ["1.0625rem", { lineHeight: "1.8" }],
        caption: ["0.8125rem", { lineHeight: "1.6", letterSpacing: "0.02em" }],
      },
      spacing: {
        section: "clamp(6rem, 14vw, 12rem)",
      },
      maxWidth: {
        content: "640px",
        wide: "1120px",
      },
      transitionTimingFunction: {
        minimal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
