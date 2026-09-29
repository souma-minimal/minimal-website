"use client";

import { useGsapSetup } from "@/lib/gsap";
import { useEffect } from "react";
import Nav from "@/components/Nav";
import ReductionCounter from "@/components/ReductionCounter";
import Hero from "@/components/Hero";
import InteractiveMinimal from "@/components/InteractiveMinimal";
import Philosophy from "@/components/Philosophy";
import ProductsIntro from "@/components/ProductsIntro";
import ScheduleShowcase from "@/components/showcases/ScheduleShowcase";
import TodoShowcase from "@/components/showcases/TodoShowcase";
import FinanceShowcase from "@/components/showcases/FinanceShowcase";
import WorldView from "@/components/WorldView";
import FinalSection from "@/components/FinalSection";

export default function Home() {
  useGsapSetup();

  // ページ再読み込み時、ブラウザが前回のスクロール位置を復元してしまうと
  // アニメーション途中の中途半端な状態から表示されてしまう。
  // 常に一番上から始まるようにし、スクロール体験の入り口を揃える。
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <Nav />
      <ReductionCounter />
      <Hero />
      <InteractiveMinimal />
      <Philosophy />
      <ProductsIntro />
      <ScheduleShowcase />
      <TodoShowcase />
      <FinanceShowcase />
      <WorldView />
      <FinalSection />
    </main>
  );
}
