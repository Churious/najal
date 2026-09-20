/**
 * 나잘알 브랜드 토큰 중앙 정의.
 * 색/라운드/그림자는 tailwind.config.js + globals.css(.brand-*)와 함께 사용.
 */

export const BRAND = {
  name: "나잘알",
  tagline: "솔직히 너, 나 잘 알지?",
  subline: "친구들이 나를 얼마나 맞힐 수 있는지 시험해보세요.",
  meta: "10문제 · 회원가입 없음 · 약 1분",
  ctaCreate: "이거 맞혀봐",
  bottomline: "누가 나를 제일 잘 아는지 확인해보자",
} as const;

/** 스토리/결과용 등급 (정답률 기준, 금지표현 제외) */
export function gradeFor(score: number): { label: string; emoji: string } {
  if (score >= 90) return { label: "찐친 인증", emoji: "🏆" };
  if (score >= 60) return { label: "꽤 잘 아는 편", emoji: "😊" };
  if (score >= 30) return { label: "아직 알아가는 중", emoji: "🌱" };
  return { label: "우리 친한 거 맞지?", emoji: "🧭" };
}

/** 한국어 받침(종성) 여부: 마지막 음절 코드로 판정 */
export function hasJongseong(word: string): boolean {
  const t = word.trim();
  const ch = t.slice(-1);
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** 조사 선택: 받침 있으면 first, 없으면 second. 예: josa(who,"이","가") */
export function josa(word: string, withJong: string, withoutJong: string): string {
  return hasJongseong(word) ? withJong : withoutJong;
}

/** “~이라면/라면” 조사 통째로 반환 — 현재 UI에서는 사용 금지.
 * 조사 분기가 필요하면 “{nickname}의 답을 맞혀보세요” 형태로 회피할 것. */
export function iramyeon(word: string): string {
  return `${word}${hasJongseong(word) ? "이라면" : "라면"}`;
}
/** Web Share 우선, 미지원/실패 시 클립보드 복사 fallback.
 * - 공유창을 사용자가 닫으면(AbortError) "dismissed" — 오류 표시 없음
 * - 그 외 공유 오류는 복사 fallback으로 진행
 * - HTTP 등 insecure context에서는 navigator.clipboard가 없을 수 있어 copyText가 textarea fallback까지 처리 */
export async function shareOrCopy(args: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "dismissed" | "failed"> {
  const { title, text, url } = args;
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "dismissed";
      // 그 외 오류는 아래 복사 fallback으로 진행
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("clipboard-unavailable");
  } catch {
    // 구형 브라우저 / insecure context / 권한 거부 fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
