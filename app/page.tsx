import Link from "next/link";
import { BRAND } from "@/app/theme";

export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col">
      {/* 로고: 텍스트 스탬프 */}
      <p className="stamp self-start" aria-label="나잘알">
        나잘알
      </p>

      {/* 히어로: 좌측 정렬로 대칭 깨기 */}
      <h1 className="mt-4 max-w-[300px] text-balance text-[32px] font-black leading-tight text-ink">
        솔직히 너,
        <br />
        나 <span className="marker px-1">잘 알지?</span>
      </h1>
      <p className="mt-3 max-w-[300px] text-[15px] font-medium leading-relaxed text-ink/70">
        {BRAND.subline}
      </p>
      <p className="mt-2 text-xs font-bold text-ink/50">{BRAND.meta}</p>

      {/* 단톡방 목업: 이름 한 글자 아바타, 낙서 밑줄 포인트 */}
      <section aria-label="단톡방 미리보기" className="relative mt-6 w-full max-w-[340px] self-center">
        <div className="tape" aria-hidden />
        <div className="brand-card space-y-2.5 p-4 pt-5">
          <p className="text-center text-[11px] font-bold text-ink/40">단톡방 &ldquo;찐친들&rdquo;</p>
          <div className="chat-row">
            <span aria-hidden className="avatar">민</span>
            <p className="chat-bubble-left">
              <span className="chat-name">민수</span>야 너 T야?
            </p>
          </div>
          <div className="chat-row">
            <span aria-hidden className="avatar">지</span>
            <p className="chat-bubble-left">
              <span className="chat-name">지현</span>야식 뭐 먹어?
            </p>
          </div>
          <div className="chat-row justify-end">
            <p className="chat-bubble-right">
              말로만 하지 말고
              <br />
              내 나잘알 풀어봐
            </p>
          </div>
          <div className="chat-row">
            <span aria-hidden className="avatar">현</span>
            <p className="chat-bubble-left">
              <span className="chat-name">현우</span>
              <span className="doodle-underline">이건 꼭 맞혀야 함</span>
            </p>
          </div>
        </div>
      </section>

      {/* 시험지 카드: 살짝 기울여 대칭 깨기 */}
      <section aria-label="시험지 미리보기" className="relative mt-4 w-full max-w-[340px] self-center">
        <div className="exam-paper relative rotate-[-1deg] p-5 pl-14 text-left">
          <p className="stamp" aria-hidden>
            나잘알 모의고사
          </p>
          <p className="mt-2 text-lg font-extrabold text-ink">
            <span className="marker px-1">Q1. 갑자기 3일 휴가가 생긴다면?</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm font-medium text-ink/70">
            <li>
              ① 집에서 쉰다{" "}
              <span aria-hidden className="doodle-circle px-1.5 font-bold text-brand-600">
                ✓
              </span>
            </li>
            <li>② 여행 간다</li>
            <li>③ 친구를 만난다</li>
            <li className="doodle-underline inline-block">④ 그날 생각한다</li>
          </ul>
          <p aria-hidden className="absolute right-4 top-4 rotate-6 text-2xl">
            ✏️
          </p>
        </div>
      </section>

      {/* CTA */}
      <Link href="/create" className="brand-btn-primary mt-8 min-h-[60px] w-full max-w-[340px] self-center content-center">
        {BRAND.ctaCreate}
      </Link>
      <p className="mt-3 self-center text-xs font-medium text-ink/50">{BRAND.bottomline}</p>
    </main>
  );
}
