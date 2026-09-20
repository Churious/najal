"use client";

import { useRef, useState } from "react";
import { gradeFor, shareOrCopy } from "@/app/theme";

export interface StoryCardData {
  ownerNickname: string;
  score: number;
  quizUrl: string;
  publicId: string;
  mostMissed?: string;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 인스타 스토리용 9:16 SVG 문자열 생성 (540x960) — 시험지+도장 콘셉트 */
export function buildStorySvg(d: StoryCardData): string {
  const grade = gradeFor(d.score);
  const name = esc(d.ownerNickname);
  const url = esc(d.quizUrl);
  const missed = d.mostMissed ? esc(d.mostMissed.length > 18 ? d.mostMissed.slice(0, 18) + "…" : d.mostMissed) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960">
  <defs>
    <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#FBBF24" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#FBBF24" stop-opacity="0.55"/>
      <stop offset="0.95" stop-color="#FBBF24" stop-opacity="0.55"/>
      <stop offset="0.95" stop-color="#FBBF24" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="540" height="960" fill="#FFFBF4"/>
  <rect x="0" y="0" width="540" height="150" fill="#FFF1F2"/>
  <text x="40" y="70" font-size="30" font-weight="900" font-family="sans-serif" fill="#E11D48" transform="rotate(-4 40 70)">나잘알 성적표</text>
  <text x="42" y="110" font-size="17" font-family="sans-serif" fill="#7c4a3a">친구들은 나를 얼마나 잘 알까?</text>
  <text x="270" y="230" text-anchor="middle" font-size="26" font-weight="700" font-family="sans-serif" fill="#2A1E1A">${name}의 답을 맞혀보세요</text>
  <text x="270" y="380" text-anchor="middle" font-size="130" font-weight="900" font-family="sans-serif" fill="#2A1E1A">${d.score}점</text>
  <text x="270" y="425" text-anchor="middle" font-size="22" font-family="sans-serif" fill="#7c4a3a">/ 100점</text>
  <g transform="rotate(-4 270 500)">
    <rect x="140" y="462" width="260" height="66" rx="10" fill="none" stroke="#E11D48" stroke-width="5"/>
    <text x="270" y="508" text-anchor="middle" font-size="32" font-weight="900" font-family="sans-serif" fill="#E11D48">${esc(grade.label)}</text>
  </g>${missed ? `
  <rect x="70" y="570" width="400" height="110" rx="16" fill="#ffffff" stroke="#F1D9DC" stroke-width="2"/>
  <text x="100" y="610" font-size="17" font-weight="800" font-family="sans-serif" fill="#BE123C">오답노트</text>
  <text x="100" y="644" font-size="19" font-family="sans-serif" fill="#2A1E1A">${missed}</text>` : ``}
  <text x="270" y="740" text-anchor="middle" font-size="24" font-weight="800" font-family="sans-serif" fill="#2A1E1A">너도 나를 맞혀봐</text>
  <text x="270" y="810" text-anchor="middle" font-size="19" font-family="sans-serif" fill="#7c4a3a">${url}</text>
  <text x="270" y="845" text-anchor="middle" font-size="19" font-weight="700" font-family="sans-serif" fill="#7c4a3a">공유코드 ${esc(d.publicId)}</text>
  <text x="270" y="905" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#a08a7d">나잘알 · 10문제 · 약 1분</text>
</svg>`;
}

/** SVG 직렬화 → canvas → PNG. 무거운 라이브러리 없이 저장/공유. */
async function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg-load-failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 540 * scale;
    canvas.height = 960 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-2d-context");
    ctx.fillStyle = "#FFFBF4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!out) throw new Error("toBlob-failed");
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 스토리 카드 미리보기(9:16) + 이미지 저장 / 공유 */
export function StoryCard({ data }: { data: StoryCardData }) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const grade = gradeFor(data.score);

  const saveImage = async () => {
    setBusy(true);
    setStatus("");
    try {
      const png = await svgToPngBlob(buildStorySvg(data));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(png);
      a.download = `najal-${data.publicId}-${data.score}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setStatus("이미지 저장됐어요! 스토리에 올려보세요");
    } catch {
      // 불가하면 공유/복사 fallback
      const r = await shareOrCopy({
        title: "나잘알",
        text: `${data.ownerNickname}의 나잘알에서 ${data.score}점! 너도 맞혀봐`,
        url: data.quizUrl,
      });
      setStatus(
        r === "shared" ? "공유했어요" : r === "copied" ? "링크 복사됐어요! 스토리에 붙여넣어 보세요" : "",
      );
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    setBusy(true);
    setStatus("");
    try {
      const png = await svgToPngBlob(buildStorySvg(data));
      const file = new File([png], `najal-${data.publicId}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (typeof nav.canShare === "function" && nav.canShare({ files: [file] }) && typeof navigator.share === "function") {
        await navigator.share({
          title: "나잘알",
          text: `${data.ownerNickname}의 나잘알에서 ${data.score}점! 너도 맞혀봐`,
          files: [file],
        });
        setStatus("공유했어요");
      } else {
        throw new Error("file-share-unsupported");
      }
    } catch {
      const r = await shareOrCopy({
        title: "나잘알",
        text: `${data.ownerNickname}의 나잘알에서 ${data.score}점! 너도 맞혀봐`,
        url: data.quizUrl,
      });
      setStatus(
        r === "shared" ? "공유했어요" : r === "copied" ? "링크 복사됐어요! 스토리에 붙여넣어 보세요" : "",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="인스타 스토리용 점수 카드" className="mt-8">
      <h2 className="text-center font-extrabold text-ink">스토리 카드</h2>
      <p className="mt-1 text-center text-xs text-ink/50">저장해서 스토리에 올리고 친구들을 시험해보세요</p>
      <div className="mx-auto mt-4 w-full max-w-[240px] overflow-hidden rounded-3xl shadow-card ring-1 ring-brand-100">
        {/* 미리보기: SVG를 직접 렌더 (9:16) */}
        <div
          ref={svgRef}
          className="aspect-[9/16] w-full"
          dangerouslySetInnerHTML={{ __html: buildStorySvg(data) }}
          role="img"
          aria-label={`${data.ownerNickname}의 나잘알 ${data.score}점, 등급 ${grade.label}`}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={saveImage}
          disabled={busy}
          className="flex-1 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          {busy ? "만드는 중..." : "이미지 저장"}
        </button>
        <button
          type="button"
          onClick={shareImage}
          disabled={busy}
          className="flex-1 rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-pop transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          {busy ? "만드는 중..." : "공유하기"}
        </button>
      </div>
      {status && (
        <p role="status" className="mt-2 text-center text-xs font-bold text-brand-700">
          {status}
        </p>
      )}
    </section>
  );
}
