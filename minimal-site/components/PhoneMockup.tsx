"use client";

import Image from "next/image";
import { forwardRef, type ReactNode } from "react";

type PhoneMockupProps = {
  /**
   * 実際のスクリーンショットへのパス（例: "/images/apps/schedule/screen-1.png"）。
   * 用意でき次第ここを指定すれば、CSSモックアップから自動的に差し替わる。
   */
  imageSrc?: string;
  imageAlt?: string;
  /** 画像の余白の取り方。実機スクショは下に余白が余ることが多いので、既定は上寄せ。 */
  imagePosition?: "top" | "center";
  /** imageSrcが無い場合に表示する、HTML/CSSによる簡易UIモックアップ */
  children?: ReactNode;
  accentClassName?: string;
};

const PhoneMockup = forwardRef<HTMLDivElement, PhoneMockupProps>(
  ({ imageSrc, imageAlt = "", imagePosition = "top", children, accentClassName }, ref) => {
    return (
      <div
        ref={ref}
        className="relative aspect-[9/19.5] w-[220px] rounded-[2.25rem] border border-black/10 bg-void p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)] sm:w-[260px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-white">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="260px"
              className={`object-cover ${imagePosition === "top" ? "object-top" : "object-center"}`}
            />
          ) : (
            <div className={`flex h-full w-full flex-col ${accentClassName ?? ""}`}>
              {children}
            </div>
          )}
        </div>
        {/* ノッチ */}
        <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-void" />
      </div>
    );
  }
);

PhoneMockup.displayName = "PhoneMockup";
export default PhoneMockup;
