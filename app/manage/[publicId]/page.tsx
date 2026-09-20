"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
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

  if (!data) return <main className="mt-10 text-center text-slate-500">불러오는 중...</main>;

  return (
    <main>
      <h1 className="text-2xl font-bold">{data.nickname}의 나잘알 관리</h1>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">총 참가자</p>
          <p className="text-xl font-bold">{data.totalParticipants}명</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">평균 점수</p>
          <p className="text-xl font-bold">{data.average}점</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">최고 점수</p>
          <p className="text-xl font-bold">{data.max}점</p>
        </div>
      </div>

      <section className="mt-6 rounded-xl bg-sky-50 p-4">
        <p className="text-sm text-slate-600">나잘알도 (전체 정답률)</p>
        <p className="text-2xl font-bold text-sky-700">{data.familiarity}%</p>
        {data.mostMisunderstood && (
          <p className="mt-1 text-sm text-slate-600">
            가장 오해받은 질문: {data.mostMisunderstood.questionText} (정답률{" "}
            {Math.round(data.mostMisunderstood.correctRate)}%)
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-bold">리더보드</h2>
        {data.leaderboard.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">아직 참가자가 없습니다.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {data.leaderboard.map((e, i) => (
              <li key={e.id} className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm">
                <span>
                  {i + 1}위 {e.nickname}
                </span>
                <span>{e.score}점</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-bold">질문별 분포</h2>
        <ul className="mt-3 space-y-3">
          {data.distributions.map((d) => (
            <li key={d.questionId} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-bold">{d.questionText}</p>
              <p className="mt-1 text-slate-500">
                정답률 {Math.round(d.correctRate)}% ({d.correctCount}/{d.total})
              </p>
              <p className="mt-1 text-xs text-slate-400">선택 분포: {d.counts.join(" / ")}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
