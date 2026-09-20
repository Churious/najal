import Link from "next/link";
import { BRAND } from "@/app/theme";

export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      {/* 로고 */}
      <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-brand-600 shadow-soft">
        <span aria-hidden>🧠</span> {BRAND.name}
      </p>

      {/* 히어로 카피 */}
      <h1 className="mt-4 max-w-[320px] text-balance text-3xl font-extrabold leading-snug text-ink">
        친구들은 나를
        <br />
        얼마나 잘 알고 있을까?
      </h1>
      <p className="mt-3 max-w-[300px] text-[15px] font-medium leading-relaxed text-ink/70">
        친구들에게 나를 맞히는 퀴즈를 내보세요
      </p>
      <p className="mt-2 text-xs font-medium text-ink/50">{BRAND.meta}</p>

      {/* 일러스트/캐릭터 요소 (이모지·CSS만, 이미지 파일 없음) */}
      <div aria-hidden className="float-y mt-6 flex items-end justify-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-4xl shadow-card ring-1 ring-brand-100">
          🦊
        </span>
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-card ring-2 ring-brand-200">
          😏
        </span>
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-4xl shadow-card ring-1 ring-brand-100">
          🐰
        </span>
      </div>
      <div aria-hidden className="mt-3 flex items-center gap-2 text-xs font-bold text-ink/40">
        <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">❓ 너 T야?</span>
        <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">🍜 야식 뭐 먹어?</span>
        <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">✈️ 여행 가면?</span>
      </div>

      {/* CTA */}
      <Link href="/create" className="brand-btn-primary mt-8 min-h-[60px] content-center">
        {BRAND.ctaCreate} 🚀
      </Link>
      <p className="mt-3 text-xs text-ink/50">누가 나를 제일 잘 아는지 확인해보세요</p>
    </main>
  );
}
