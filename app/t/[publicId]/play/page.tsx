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
        <p className="stamp" aria-hidden>
          <span className="inline-block max-w-[160px] truncate align-bottom">{who}</span>의 나잘알
        </p>
        <h1 className="mt-3 max-w-[300px] text-balance text-xl font-black text-ink">
          {who}의 답을 맞혀보세요
        </h1>
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
      <div className="exam-paper relative p-5 pl-12">
        <p className="mt-2 truncate text-center text-sm font-extrabold text-ink">
          <span className="min-w-0 break-words">{who}</span>의 나잘알{" "}
          <span className="font-medium text-ink/40">· 친구 도전 중 {index + 1}/{QUESTIONS.length}</span>
        </p>
        <div className="mt-3">
          <ProgressBar index={index} total={QUESTIONS.length} />
        </div>
        {isLast && (
          <p className="mt-3 rounded-xl bg-point-400/20 px-3 py-2 text-center text-xs font-extrabold text-point-500">
            마지막 문제예요!
          </p>
        )}
        <div key={index} className="q-anim">
          <p className="mt-4 rounded-2xl bg-white/80 px-3 py-2 text-xs font-bold text-ink/50 ring-1 ring-brand-100">
            {who}의 답을 맞혀보세요
          </p>
          <h1 className="mt-3 min-w-0 break-words text-xl font-extrabold leading-snug text-ink">
            {q.text}
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
              {loading ? "제출 중..." : "결과 보기"}
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
