import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-sky-600">나를 맞히는 퀴즈</p>
      <h1 className="mt-3 text-3xl font-bold leading-snug">
        친구들은 나를
        <br />
        얼마나 알고 있을까?
      </h1>
      <p className="mt-4 text-sm text-slate-500">10문제 · 회원가입 없음 · 약 1분</p>
      <Link
        href="/create"
        className="mt-8 w-full rounded-xl bg-sky-600 py-4 text-center text-lg font-bold text-white hover:bg-sky-700"
      >
        내 나잘알 만들기
      </Link>
    </main>
  );
}
