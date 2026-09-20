/**
 * 나잘알 브랜드 토큰 중앙 정의.
 * 색/라운드/그림자는 tailwind.config.js + globals.css(.brand-*)와 함께 사용.
 */

export const BRAND = {
  name: "나잘알",
  tagline: "친구들은 나를 얼마나 잘 알고 있을까?",
  subline: "친구들에게 나를 맞히는 퀴즈를 내보세요",
  meta: "10문제 · 회원가입 없음 · 약 1분",
  ctaCreate: "친구들 시험 내기",
} as const;

/** 스토리카드/결과용 등급 (금지표현 제외) */
export function gradeFor(score: number): { label: string; emoji: string } {
  if (score >= 100) return { label: "찐친 중의 찐친", emoji: "🏆" };
  if (score >= 90) return { label: "찐친", emoji: "❤️" };
  if (score >= 80) return { label: "꽤 친한 사이", emoji: "😊" };
  if (score >= 70) return { label: "제법 친함", emoji: "🌱" };
  if (score >= 50) return { label: "알아가는 중", emoji: "🌤️" };
  if (score >= 30) return { label: "아직 멀었음", emoji: "🧭" };
  return { label: "이제부터 친해져요", emoji: "🌱" };
}

/** Web Share 우선, 미지원시 클립보드 복사 fallback. 성공시 "shared"|"copied", 취소시 "dismissed". */
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
    } catch {
      return "dismissed";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 구형 브라우저 fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
