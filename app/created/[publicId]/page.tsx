"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyLinkCard } from "@/app/components/ui";
import { shareOrCopy } from "@/app/theme";

export const dynamic = "force-dynamic";

export default function CreatedPage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // SSR 안전: 렌더 시점이 아닌 클릭 시점에 URL 계산
  const quizUrl = () => `${window.location.origin}/t/${publicId}`;
  const quizPath = `/t/${publicId}`;

  const share = async () => {
    const r = await shareOrCopy({
      title: "나잘알",
      text: "내 나잘알에 도전해 봐! 너는 나를 얼마나 알까?",
      url: quizUrl(),
    });
    setStatus(
      r === "shared" ? "공유했어요" : r === "copied" ? "링크 복사됐어요! 친구들에게 보내보세요" : "",
    );
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

      <button onClick={share} className="brand-btn-primary mt-6 min-h-[60px]">
        친구한테 보내기
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
