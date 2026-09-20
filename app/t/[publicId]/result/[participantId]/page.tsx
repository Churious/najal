"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        <h1 className="mt-10 text-xl font-bold">{error}</h1>
        <Link href="/" className="mt-6 block w-full rounded-xl bg-sky-600 py-3 font-bold text-white">
          홈으로
        </Link>
      </main>
    );
  }

  if (!result) return <main className="mt-10 text-center text-slate-500">불러오는 중...</main>;

  return (
    <main>
      <p className="text-sm text-slate-500">
        {result.ownerNickname}의 나잘알 · {result.nickname}의 결과
      </p>
      <h1 className="mt-2 text-4xl font-bold">
        {result.score}점 <span className="text-lg font-normal text-slate-500">/ 100</span>
      </h1>
      <p className="mt-2 font-bold text-sky-700">{result.message}</p>
      <p className="mt-1 text-sm text-slate-500">
        {result.totalParticipants}명 중 {result.rank}위 · {result.totalQuestions}문제 중{" "}
        {result.correctCount}개 정답
      </p>

      {result.wrongAnswers.length > 0 && (
        <section className="mt-6">
          <h2 className="font-bold">틀린 문제</h2>
          <ul className="mt-3 space-y-3">
            {result.wrongAnswers.map((w) => (
              <li key={w.questionId} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-bold">{w.questionText}</p>
                <p className="mt-1 text-slate-500">내 예상: {w.guessed}</p>
                <p className="text-sky-700">실제 답: {w.actual}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {board.length > 0 && (
        <section className="mt-6">
          <h2 className="font-bold">리더보드 TOP 5</h2>
          <ol className="mt-3 space-y-2">
            {board.map((e, i) => (
              <li
                key={e.id}
                className={`flex justify-between rounded-xl px-4 py-2 text-sm ${
                  e.id === participantId ? "bg-sky-50 font-bold" : "bg-slate-50"
                }`}
              >
                <span>
                  {i + 1}위 {e.nickname}
                </span>
                <span>{e.score}점</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Link
        href="/create"
        className="mt-8 block w-full rounded-xl bg-sky-600 py-4 text-center text-lg font-bold text-white"
      >
        나도 내 나잘알 만들기
      </Link>
    </main>
  );
}
