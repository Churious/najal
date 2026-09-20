"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TakeQuizPage({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const router = useRouter();
  const [owner, setOwner] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${publicId}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setOwner(data.nickname);
      })
      .catch(() => setNotFound(true));
  }, [publicId]);

  const join = () => {
    const name = nickname.trim();
    if (name.length < 2 || name.length > 12) {
      setError("닉네임은 2~12자로 입력해 주세요.");
      return;
    }
    router.push(`/t/${publicId}/play?nickname=${encodeURIComponent(name)}`);
  };

  if (notFound) {
    return (
      <main className="text-center">
        <h1 className="mx-auto mt-4 max-w-[300px] text-balance text-xl font-extrabold leading-snug text-ink">
          퀴즈를 찾을 수 없어요
        </h1>
        <p className="mt-2 text-sm text-ink/60">주소를 다시 확인해 주세요.</p>
        <Link href="/" className="brand-btn-primary mt-6 block min-h-[56px] content-center">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="text-center">
      <p className="stamp" aria-hidden>
        {owner ? (
          <span className="inline-block max-w-[200px] truncate align-bottom">{owner}</span>
        ) : (
          "나잘알"
        )}
        의 답을 맞혀보세요
      </p>
      <h1 className="mx-auto mt-3 max-w-[320px] text-balance text-2xl font-black leading-snug text-ink">
        {owner ? (
          <>
            <span className="min-w-0 break-words text-brand-600">{owner}</span>의 답을 맞혀보세요
          </>
        ) : (
          <>나를 얼마나 잘 알아?</>
        )}
      </h1>
      <p className="mt-2 text-sm text-ink/60">10문제 · 약 1분 · 누가 제일 잘 아는지 확인해보자</p>

      <div className="exam-paper relative mt-6 p-5 pl-14 text-left">
        <label htmlFor="join-nickname" className="mt-2 block text-sm font-bold text-ink">
          도전할 내 이름
        </label>
        <input
          id="join-nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="내 닉네임 (2~12자)"
          onKeyDown={(e) => e.key === "Enter" && join()}
          className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3.5 text-lg outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        <button onClick={join} className="brand-btn-primary mt-4 min-h-[60px]">
          도전 시작하기
        </button>
      </div>
    </main>
  );
}
