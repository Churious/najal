"use client";

import { useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CreatedPage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const quizUrl = () => `${window.location.origin}/t/${publicId}`;

  const share = async () => {
    const url = quizUrl();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "나잘알", text: "내 나잘알에 도전해 봐!", url });
        setShared(true);
        return;
      } catch {
        /* 사용자가 취소하면 클립보드 폴백 */
      }
    }
    await copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="text-center">
      <h1 className="mt-10 text-2xl font-bold">나잘알이 완성됐어요!</h1>
      <p className="mt-3 text-sm text-slate-500">링크를 친구들에게 공유해 보세요.</p>
      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 break-all">
        /t/{publicId}
      </div>
      <button
        onClick={share}
        className="mt-6 w-full rounded-xl bg-sky-600 py-4 text-lg font-bold text-white hover:bg-sky-700"
      >
        공유하기
      </button>
      <button
        onClick={copyLink}
        className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-bold text-slate-700"
      >
        {copied ? "링크 복사됨!" : "링크 복사"}
      </button>
      {shared && <p className="mt-3 text-sm text-slate-500">공유했습니다.</p>}
      <Link
        href={`/manage/${publicId}`}
        className="mt-6 block w-full rounded-xl bg-slate-900 py-3 font-bold text-white"
      >
        내 결과 보기
      </Link>
    </main>
  );
}
