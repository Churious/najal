"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gradeFor } from "@/app/theme";
import { StoryCard } from "@/app/components/StoryCard";

export const dynamic = "force-dynamic";

interface WrongAnswer {
  questionId: number;
  questionText: string;
  guessed: string;
  actual: string;
}

interface ResultData {
  nickname: string;
  ownerNickname: string;
  score: number;
  message: string;
  rank: number;
  totalParticipants: number;
  correctCount: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
}

interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
}

export default function ResultPage({
  params,
}: {
  params: { publicId: string; participantId: string };
}) {
  const { publicId, participantId } = params;
  const [result, setResult] = useState<ResultData | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/quizzes/${publicId}/result/${participantId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "결과를 불러오지 못했습니다.");
          return;
        }
        setResult(data);
      })
      .catch(() => setError("네트워크 오류가 발생했습니다."));
    fetch(`/api/quizzes/${publicId}/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.leaderboard)) setBoard(data.leaderboard.slice(0, 5));
      })
      .catch(() => {});
  }, [publicId, participantId]);

  if (error) {
    return (
      <main className="text-center">
        <h1 className="mt-10 text-xl font-extrabold text-ink">{error}</h1>
        <Link href="/" className="brand-btn-primary mt-6 block min-h-[56px] content-center">
          홈으로
        </Link>
      </main>
    );
  }

  if (!result) return <main className="mt-10 text-center text-ink/50">불러오는 중...</main>;

  const grade = gradeFor(result.score);

  return (
    <main>
      <div className="brand-card overflow-hidden">
        <div className="bg-ink px-5 pb-6 pt-5 text-center text-white">
          <p className="truncate text-xs font-bold text-white/70">
            <span className="break-words">{result.ownerNickname}</span>의 나잘알 ·{" "}
            <span className="break-words">{result.nickname}</span>의 성적표
          </p>
          <p className="mt-2 text-6xl font-black tracking-tight">
            {result.score}
            <span className="text-xl font-bold text-white/60">/100</span>
          </p>
          <p className="mx-auto mt-3 inline-block rotate-[-3deg] rounded-lg border-[3px] border-point-400 px-4 py-1.5 text-sm font-black tracking-wide text-point-400">
            {grade.label}
          </p>
          <p className="mt-3 break-words text-sm font-medium text-white/85">{result.message}</p>
          <p className="mt-1 text-xs text-white/60">
            {result.totalParticipants}명 중 {result.rank}위 · {result.totalQuestions}문제 중{" "}
            {result.correctCount}개 정답
          </p>
        </div>

        <div className="p-5">
          {result.wrongAnswers.length > 0 && (
            <section aria-label="오답노트">
              <h2 className="font-extrabold text-ink">
                오답노트 <span className="text-xs font-bold text-ink/40">— 이걸 틀리면 조금 서운함</span>
              </h2>
              <ul className="mt-3 space-y-2.5">
                {result.wrongAnswers.map((w) => (
                  <li key={w.questionId} className="exam-paper p-4 pl-12 text-sm">
                    <p className="break-words font-bold text-ink">{w.questionText}</p>
                    <p className="mt-1 break-words text-ink/60">네 예상: {w.guessed}</p>
                    <p className="break-words font-bold text-brand-700">실제 답: {w.actual}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {board.length > 0 && (
            <section className="mt-6">
              <h2 className="font-extrabold text-ink">리더보드 TOP 5</h2>
              <ol className="mt-3 space-y-2">
                {board.map((e, i) => (
                  <li
                    key={e.id}
                    className={`flex items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-sm ${
                      e.id === participantId
                        ? "bg-brand-50 font-extrabold text-brand-900 ring-2 ring-brand-200"
                        : "bg-slate-50 text-ink"
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {i === 0 ? "1위" : i === 1 ? "2위" : i === 2 ? "3위" : `${i + 1}위`}{" "}
                      <span className="break-words">{e.nickname}</span>
                    </span>
                    <span className="shrink-0 font-extrabold">{e.score}점</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Link
            href={`/t/${publicId}`}
            className="brand-btn-ghost mt-6 block min-h-[56px] content-center !text-base"
          >
            다른 친구도 풀어보기
          </Link>
          <Link
            href="/create"
            className="brand-btn-primary mt-2.5 block min-h-[60px] content-center"
          >
            내 퀴즈 만들기
          </Link>
        </div>
      </div>

      <StoryCard
        data={{
          ownerNickname: result.ownerNickname,
          score: result.score,
          publicId,
          quizUrl: typeof window !== "undefined" ? `${window.location.origin}/t/${publicId}` : `/t/${publicId}`,
          mostMissed: result.wrongAnswers[0]?.questionText,
        }}
      />
    </main>
  );
}
