"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyLinkCard, StatCard } from "@/app/components/ui";
import { shareOrCopy } from "@/app/theme";

export const dynamic = "force-dynamic";

interface ManageData {
  nickname: string;
  publicId: string;
  totalParticipants: number;
  average: number;
  max: number;
  leaderboard: { id: string; nickname: string; score: number; createdAt: string }[];
  distributions: {
    questionId: number;
    questionText: string;
    counts: [number, number, number, number];
    total: number;
    correctCount: number;
    correctRate: number;
  }[];
  familiarity: number;
  mostMisunderstood: { questionId: number; questionText: string; correctRate: number } | null;
}

export default function ManagePage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const [data, setData] = useState<ManageData | null>(null);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const [shared, setShared] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const token = localStorage.getItem(`najal_owner_${publicId}`);
    if (!token) {
      setError("이 기기에 저장된 관리자 토큰이 없습니다. 퀴즈를 만든 기기에서 열어 주세요.");
      return;
    }
    fetch(`/api/quizzes/${publicId}/manage`, { headers: { "x-owner-token": token } })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) {
          setError(d.error ?? "통계를 불러오지 못했습니다.");
          return;
        }
        setData(d);
      })
      .catch(() => setError("네트워크 오류가 발생했습니다."));
  }, [publicId]);

  const share = async () => {
    const r = await shareOrCopy({
      title: "나잘알",
      text: "내 나잘알에 도전해 봐! 너는 나를 얼마나 알까? 👀",
      url: `${window.location.origin}/t/${publicId}`,
    });
    setShared(
      r === "shared" ? "공유했어요 🎉" : r === "copied" ? "링크 복사됐어요! 친구들에게 보내보세요 🎉" : "",
    );
  };

  if (error) {
    return (
      <main className="text-center">
        <div aria-hidden className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-card">
          🔒
        </div>
        <h1 className="mx-auto mt-4 max-w-[300px] text-balance text-lg font-extrabold leading-snug text-ink">
          {error}
        </h1>
        <Link href="/" className="brand-btn-primary mt-6 block min-h-[56px] content-center">
          홈으로
        </Link>
      </main>
    );
  }

  if (!data) return <main className="mt-10 text-center text-ink/50">불러오는 중...</main>;

  const quizPath = `/t/${publicId}`;

  return (
    <main>
      {/* 관리 헤더: 관리용임을 명시 */}
      <p className="text-center text-xs font-bold text-ink/40">🔧 나만 보는 관리 화면</p>
      <h1 className="mt-1 truncate text-center text-2xl font-extrabold text-ink">
        <span className="break-words">{data.nickname}</span>의 나잘알 관리
      </h1>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <StatCard emoji="👥" label="총 참가자" value={`${data.totalParticipants}명`} />
        <StatCard emoji="📊" label="평균 점수" value={`${data.average}점`} />
        <StatCard emoji="👑" label="최고 점수" value={`${data.max}점`} />
      </div>

      <section className="brand-card mt-3 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-point-500 px-5 py-4 text-white">
          <p className="text-xs font-bold text-white/80">💞 나잘알도 (전체 정답률)</p>
          <p className="text-3xl font-black">{data.familiarity}%</p>
          {data.mostMisunderstood && (
            <p className="mt-1 min-w-0 break-words text-xs text-white/85">
              가장 오해받은 질문: {data.mostMisunderstood.questionText} (정답률{" "}
              {Math.round(data.mostMisunderstood.correctRate)}%)
            </p>
          )}
        </div>
      </section>

      {/* 공유용 영역과 분리: 친구 모으기 카드 */}
      <section className="brand-card mt-3 p-4">
        <p className="text-sm font-extrabold text-ink">📤 친구들 더 모으기</p>
        <div className="mt-2">
          <CopyLinkCard url={origin ? `${origin}${quizPath}` : quizPath} label="내 시험지 링크" />
        </div>
        <button
          onClick={share}
          className="mt-2.5 w-full rounded-2xl bg-brand-600 py-3 text-sm font-bold text-white shadow-pop transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          공유하기
        </button>
        {shared && (
          <p role="status" className="mt-2 text-center text-xs font-bold text-brand-700">
            {shared}
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-extrabold text-ink">🏅 리더보드</h2>
        {data.leaderboard.length === 0 ? (
          <div className="brand-card mt-3 p-6 text-center">
            <p aria-hidden className="text-4xl">🌱</p>
            <p className="mt-2 text-sm font-bold text-ink">아직 도전한 친구가 없어요</p>
            <p className="mt-1 text-xs text-ink/50">링크를 공유하고 누가 제일 잘 아는지 확인해보세요!</p>
          </div>
        ) : (
          <ol className="mt-3 space-y-2">
            {data.leaderboard.map((e, i) => (
              <li
                key={e.id}
                className="brand-card flex items-center justify-between gap-2 !rounded-2xl px-4 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-ink">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}위`}{" "}
                  <span className="break-words font-bold">{e.nickname}</span>
                </span>
                <span className="shrink-0 font-extrabold text-brand-700">{e.score}점</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-extrabold text-ink">📝 질문별 분포</h2>
        <ul className="mt-3 space-y-2.5">
          {data.distributions.map((d) => {
            const max = Math.max(...d.counts, 1);
            return (
              <li key={d.questionId} className="brand-card !rounded-2xl p-4 text-sm">
                <p className="min-w-0 break-words font-bold text-ink">{d.questionText}</p>
                <p className="mt-1 text-xs font-bold text-brand-700">
                  정답률 {Math.round(d.correctRate)}% ({d.correctCount}/{d.total})
                </p>
                <div className="mt-2 space-y-1" aria-label={`선택 분포: ${d.counts.join(", ")}`}>
                  {d.counts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 shrink-0 text-[11px] text-ink/50">보기 {i + 1}</span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-point-500"
                          style={{ width: `${Math.round((c / max) * 100)}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-[11px] font-bold text-ink/60">{c}</span>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
