"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CopyLinkCard } from "@/app/components/ui";
import { copyText } from "@/app/theme";

export const dynamic = "force-dynamic";

export default function CreatedPage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    fetch(`/api/quizzes/${publicId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.nickname) setOwner(data.nickname);
      })
      .catch(() => {});
  }, [publicId]);

  // SSR 안전: 렌더 시점이 아닌 클릭 시점에 URL 계산
  const quizUrl = () => `${window.location.origin}/t/${publicId}`;
  const quizPath = `/t/${publicId}`;

  const copyQuizUrl = async () => {
    const ok = await copyText(quizUrl());
    setStatus(
      ok
        ? "링크가 복사됐어요! 친구들에게 보내보세요"
        : "복사에 실패했어요. 아래 링크를 길게 눌러 직접 복사해 주세요.",
    );
  };

  const busyRef = useRef(false);

  const handleShare = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus("");
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        const who = owner || "친구";
        const shareData = {
          title: `${who}의 나잘알`,
          text: `${who}의 답을 맞혀보세요!`,
          url: quizUrl(),
        };
        let shared = false;
        let dismissed = false;
        try {
          await navigator.share(shareData);
          shared = true;
        } catch (error) {
          // 사용자가 공유창을 닫은 경우에는 오류로 표시하지 않음
          if (error instanceof DOMException && error.name === "AbortError") dismissed = true;
          // 그 외 오류는 복사 fallback으로 진행
        }
        if (shared) {
          setStatus("공유했어요");
          return;
        }
        if (dismissed) return;
      }
      await copyQuizUrl();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <main className="text-center">
      <p className="stamp" aria-hidden>
        채점 완료
      </p>
      <h1 className="mt-3 text-balance text-2xl font-black leading-snug text-ink">
        시험 끝!
      </h1>
      <p className="mt-2 text-sm text-ink/60">이제 친구들이 얼마나 틀리는지 확인해보세요.</p>

      <button onClick={handleShare} disabled={busy} className="brand-btn-primary mt-6 min-h-[60px]">
        {busy ? "공유 준비 중…" : "친구한테 보내기"}
      </button>

      <div className="mt-3 text-left">
        <CopyLinkCard url={origin ? `${origin}${quizPath}` : quizPath} label="내 시험지 링크" />
      </div>
      {status && (
        <p role="status" className="mt-2 text-xs font-bold text-brand-700">
          {status}
        </p>
      )}

      <Link
        href={`/manage/${publicId}`}
        className="brand-btn-ghost mt-3 block min-h-[56px] content-center !text-base"
      >
        결과 보기
      </Link>
    </main>
  );
}
