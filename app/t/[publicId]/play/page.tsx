"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { ProgressBar, OptionButton } from "@/app/components/ui";

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
        <p className="text-center text-sm font-extrabold text-brand-600">
          🧠 <span className="max-w-[160px] truncate align-bottom">{who}의 나잘알</span>
        </p>
        <h1 className="mt-2 text-center text-xl font-extrabold text-ink">닉네임을 입력해 주세요</h1>
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
  const isLast = index === QUESTIONS.length - 1;
  const done = picks.every((p) => p >= 0);

  return (
    <main>
      <div className="brand-card p-5">
        <p className="truncate text-center text-sm font-extrabold text-brand-600">
          🧠 {who}의 나잘알 <span className="font-medium text-ink/40">· {nickname} 도전 중</span>
        </p>
        <div className="mt-3">
          <ProgressBar index={index} total={QUESTIONS.length} />
        </div>
        {isLast && (
          <p className="mt-3 rounded-xl bg-point-400/20 px-3 py-2 text-center text-xs font-extrabold text-point-500">
            🎉 마지막 문제예요!
          </p>
        )}
        <div key={index} className="q-anim">
          <h1 className="mt-4 min-w-0 break-words text-xl font-extrabold leading-snug text-ink">
            <span className="min-w-0 break-words text-brand-600">{who}</span>
            {who.endsWith("이") || who.endsWith("가") ? "라면" : "이라면"}?
            <br />
            <span className="text-lg font-bold text-ink">{q.text}</span>
          </h1>
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
              {loading ? "제출 중..." : "🔥 결과 보기"}
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

function NicknameForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="brand-card mt-4 p-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={12}
        placeholder="내 닉네임 (2~12자)"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const n = name.trim();
            if (n.length < 2 || n.length > 12) {
              setError("닉네임은 2~12자로 입력해 주세요.");
              return;
            }
            onSubmit(n);
          }
        }}
        aria-label="내 닉네임"
        className="mt-1 w-full rounded-2xl border-2 border-slate-200 px-4 py-3.5 text-lg outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      <button
        onClick={() => {
          const n = name.trim();
          if (n.length < 2 || n.length > 12) {
            setError("닉네임은 2~12자로 입력해 주세요.");
            return;
          }
          onSubmit(n);
        }}
        className="brand-btn-primary mt-4 min-h-[60px]"
      >
        시작하기
      </button>
    </div>
  );
}
