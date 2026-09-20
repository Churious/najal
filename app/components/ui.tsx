"use client";

import { useEffect, useState } from "react";
import { copyText } from "@/app/theme";

/** 시각적 프로그레스바 (브랜드컬러, n/10 표시) */
export function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-brand-700" aria-live="polite">
          {index + 1}/{total}
        </p>
        <p className="text-xs text-ink/50">{pct}%</p>
      </div>
      <div
        className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-brand-100"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`전체 ${total}문제 중 ${index + 1}번째`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-point-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 답변 선택지 버튼: 선택상태(배경+테두리+체크), 충분한 높이, aria-pressed */
export function OptionButton({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`brand-opt break-words ${
        selected
          ? "border-brand-600 bg-brand-50 font-bold text-brand-900"
          : "border-slate-200 text-ink hover:border-brand-200 hover:bg-brand-50/50"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
          selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

/** 링크 복사 카드형 UI + 복사 토스트 */
export function CopyLinkCard({ url, label }: { url: string; label: string }) {
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2000);
    return () => clearTimeout(t);
  }, [toast ]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={async () => {
          if (await copyText(url)) setToast(true);
        }}
        aria-label={`${label} 복사하기`}
        className="brand-card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-soft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl">
          🔗
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-ink/50">{label}</span>
          <span className="block truncate text-sm font-bold text-ink">{url}</span>
        </span>
        <span aria-hidden className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white">
          복사
        </span>
      </button>
      {toast && (
        <p role="status" className="toast-anim absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-bold text-white shadow-soft">
          링크 복사됐어요! 친구들에게 보내보세요 🎉
        </p>
      )}
    </div>
  );
}

/** 상단 통계 카드 (관리용) */
export function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="brand-card min-w-0 p-3 text-center">
      <p aria-hidden className="text-xl">{emoji}</p>
      <p className="mt-1 truncate text-[11px] font-medium text-ink/50">{label}</p>
      <p className="truncate text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
