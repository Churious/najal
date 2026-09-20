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
        <h1 className="mt-10 text-xl font-bold">퀴즈를 찾을 수 없습니다.</h1>
        <p className="mt-2 text-sm text-slate-500">주소를 다시 확인해 주세요.</p>
        <Link href="/" className="mt-6 block w-full rounded-xl bg-sky-600 py-3 font-bold text-white">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main>
      <h1 className="mt-6 text-2xl font-bold leading-snug">
        {owner ? `${owner}의 나잘알` : "나잘알"}에
        <br />
        도전해 보세요!
      </h1>
      <p className="mt-2 text-sm text-slate-500">10문제 · 약 1분</p>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={12}
        placeholder="내 닉네임 (2~12자)"
        className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-sky-500"
      />
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button
        onClick={join}
        className="mt-6 w-full rounded-xl bg-sky-600 py-4 text-lg font-bold text-white hover:bg-sky-700"
      >
        참가하기
      </button>
    </main>
  );
}
