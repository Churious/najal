"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [nickname, setNickname] = useState("");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startQuiz = () => {
    const name = nickname.trim();
    if (name.length < 2 || name.length > 12) {
      setError("닉네임은 2~12자로 입력해 주세요.");
      return;
    }
    setError("");
    setStep(1);
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          answers: QUESTIONS.map((q, i) => ({ questionId: q.id, selectedOption: picks[i] })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "생성에 실패했습니다.");
        return;
      }
      localStorage.setItem(`najal_owner_${data.publicId}`, data.ownerToken);
      router.push(`/created/${data.publicId}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <main>
        <p className="text-sm text-slate-500">Step 1/2 · 닉네임</p>
        <h1 className="mt-2 text-2xl font-bold">닉네임을 입력해 주세요</h1>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="예: 민수 (2~12자)"
          className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-sky-500"
        />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <button
          onClick={startQuiz}
          className="mt-6 w-full rounded-xl bg-sky-600 py-4 text-lg font-bold text-white hover:bg-sky-700"
        >
          다음
        </button>
      </main>
    );
  }

  const q = QUESTIONS[index];
  const done = picks.every((p) => p >= 0);

  return (
    <main>
      <p className="text-sm text-slate-500">
        Step 2/2 · {index + 1}/{QUESTIONS.length}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <h1 className="mt-4 text-xl font-bold">{q.text}</h1>
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
            {loading ? "만드는 중..." : "나잘알 만들기"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </main>
  );
}
