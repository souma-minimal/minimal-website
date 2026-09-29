"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const APPS = [
  { label: "Schedule", href: "#schedule", icon: "/images/brand/schedule-icon.png", accent: "bg-accent-schedule" },
  { label: "Todo", href: "#todo", icon: "/images/brand/todo-icon.png", accent: "bg-accent-todo" },
  { label: "Finance", href: "#finance", icon: null, accent: "bg-accent-finance" },
];

/**
 * ナビゲーションは常時白 + mix-blend-mode: difference。
 * 背景が白でも黒でも、JSでテーマを判定することなく
 * 自動的に読みやすい反転色になる。
 * ドロップダウンパネルはこのブレンド対象の外（兄弟要素）に置き、
 * 通常の白背景パネルとして描画する。
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-wide items-center justify-between px-6 py-6 mix-blend-difference md:px-10">
        <a href="#top" className="text-[15px] font-medium tracking-tight text-white">
          minimal
        </a>
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-[13px] text-white/90 transition-opacity duration-300 hover:opacity-60"
            aria-expanded={open}
          >
            Apps
            <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
              ⌄
            </span>
          </button>
          <a
            href="#about"
            className="text-[13px] text-white/90 transition-opacity duration-300 hover:opacity-60"
          >
            About
          </a>
        </div>
      </nav>

      {/* Appsドロップダウン：blend対象の外なので通常の白パネルとして表示される */}
      {open && (
        <div ref={wrapRef} className="absolute right-6 top-16 md:right-10">
          <div className="w-56 overflow-hidden rounded-2xl border border-line bg-white/95 py-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] backdrop-blur">
            {APPS.map((app) => (
              <a
                key={app.href}
                href={app.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 hover:bg-mist"
              >
                {app.icon ? (
                  <span className="relative h-7 w-7 overflow-hidden rounded-[8px]">
                    <Image src={app.icon} alt="" fill sizes="28px" />
                  </span>
                ) : (
                  <span className={`h-7 w-7 rounded-[8px] ${app.accent}`} />
                )}
                <span className="text-[13px] text-ink">minimal {app.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
