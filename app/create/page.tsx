"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { ProgressBar, OptionButton } from "@/app/components/ui";

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
        <p className="text-center text-sm font-extrabold text-brand-600">🧠 나잘알</p>
        <h1 className="mt-2 text-center text-2xl font-extrabold leading-snug text-ink">
          친구들을 시험할
          <br />
          시험지를 만들어보세요
        </h1>
        <p className="mt-2 text-center text-xs text-ink/50">10문제 · 회원가입 없음 · 약 1분</p>
        <div className="brand-card mt-6 p-5">
          <label htmlFor="nickname" className="text-sm font-bold text-ink">
            내 닉네임
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="예: 민수 (2~12자)"
            onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3.5 text-lg outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-500">
              {error}
            </p>
          )}
          <button onClick={startQuiz} className="brand-btn-primary mt-4 min-h-[60px]">
            내 답 정하러 가기 →
          </button>
        </div>
      </main>
    );
  }

  const q = QUESTIONS[index];
  const done = picks.every((p) => p >= 0);
  const isLast = index === QUESTIONS.length - 1;

  return (
    <main>
      <div className="brand-card p-5">
        <ProgressBar index={index} total={QUESTIONS.length} />
        {isLast && (
          <p className="mt-3 rounded-xl bg-point-400/20 px-3 py-2 text-center text-xs font-extrabold text-point-500">
            🎉 마지막 문제예요! 조금만 더 힘내요
          </p>
        )}
        {/* key로 질문 전환 애니메이션 */}
        <div key={index} className="q-anim">
          <h1 className="mt-4 min-w-0 break-words text-xl font-extrabold leading-snug text-ink">
            <span className="mr-1 text-brand-600">Q{index + 1}.</span> {q.text}
          </h1>
          <p className="mt-1 text-xs text-ink/50">내 정답을 골라주세요 — 친구들이 이걸 맞혀야 해요</p>
          <div className="mt-4 space-y-2.5" role="group" aria-label={`질문 ${index + 1}: ${q.text}`}>
            {q.options.map((opt, i) => (
              <OptionButton
                key={i}
                label={opt}
                selected={picks[index] === i}
                onSelect={() => setPicks((prev) => prev.map((p, j) => (j === index ? i : p)))}
              />
            ))}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {index > 0 && (
            <button
              onClick={() => setIndex((v) => v - 1)}
              className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3.5 font-bold text-ink/60 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              ← 이전
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => picks[index] >= 0 && setIndex((v) => v + 1)}
              disabled={picks[index] < 0}
              className="brand-btn-primary flex-[2] !py-3.5 !text-base"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!done || loading}
              className="brand-btn-primary flex-[2] !py-3.5 !text-base"
            >
              {loading ? "만드는 중..." : "🎉 시험지 완성하기"}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
