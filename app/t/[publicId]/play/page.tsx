"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS } from "@/data/questions";

export const dynamic = "force-dynamic";

export default function PlayPage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialNickname = searchParams.get("nickname") ?? "";

  const [nickname, setNickname] = useState(initialNickname);
  const [owner, setOwner] = useState("");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${publicId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.nickname) setOwner(data.nickname);
      })
      .catch(() => {});
  }, [publicId]);

  const who = owner || "친구";

  // 쿼리로 닉네임이 없으면 먼저 입력받는다
  if (!initialNickname && !nickname) {
    return (
      <main>
        <h1 className="mt-6 text-xl font-bold">닉네임을 입력해 주세요</h1>
        <NicknameForm
          onSubmit={(name) => {
            setNickname(name);
            router.replace(`/t/${publicId}/play?nickname=${encodeURIComponent(name)}`);
          }}
        />
      </main>
    );
  }

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${publicId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          answers: QUESTIONS.map((q, i) => ({ questionId: q.id, selectedOption: picks[i] })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "제출에 실패했습니다.");
        return;
      }
      router.push(`/t/${publicId}/result/${data.participantId}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const q = QUESTIONS[index];
  const done = picks.every((p) => p >= 0);

  return (
    <main>
      <p className="text-sm text-slate-500">
        {nickname} 도전 중 · {index + 1}/{QUESTIONS.length}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <h1 className="mt-4 text-xl font-bold">
        {who}
        {who.endsWith("이") || who.endsWith("가") ? "라면" : "이라면"}?
        <br />
        <span className="text-base font-normal text-slate-600">{q.text}</span>
      </h1>
      <div className="mt-5 space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setPicks((prev) => prev.map((p, j) => (j === index ? i : p)))}
            className={`w-full rounded-xl border px-4 py-3 text-left ${
              picks[index] === i
                ? "border-sky-600 bg-sky-50 font-bold"
                : "border-slate-200 bg-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        {index > 0 && (
          <button
            onClick={() => setIndex((v) => v - 1)}
            className="flex-1 rounded-xl border border-slate-300 py-3 font-bold text-slate-600"
          >
            이전으로
          </button>
        )}
        {index < QUESTIONS.length - 1 ? (
          <button
            onClick={() => picks[index] >= 0 && setIndex((v) => v + 1)}
            disabled={picks[index] < 0}
            className="flex-1 rounded-xl bg-sky-600 py-3 font-bold text-white disabled:bg-slate-300"
          >
            다음
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!done || loading}
            className="flex-1 rounded-xl bg-sky-600 py-3 font-bold text-white disabled:bg-slate-300"
          >
            {loading ? "제출 중..." : "결과 보기"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </main>
  );
}

function NicknameForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={12}
        placeholder="내 닉네임 (2~12자)"
        className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-sky-500"
      />
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button
        onClick={() => {
          const n = name.trim();
          if (n.length < 2 || n.length > 12) {
            setError("닉네임은 2~12자로 입력해 주세요.");
            return;
          }
          onSubmit(n);
        }}
        className="mt-6 w-full rounded-xl bg-sky-600 py-4 text-lg font-bold text-white"
      >
        시작하기
      </button>
    </div>
  );
}
