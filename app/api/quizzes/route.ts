import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateOwnerToken, generatePublicId } from "@/lib/owner-token";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeNickname, validateAnswers, validateNickname } from "@/lib/validation";

const MAX_BODY_BYTES = 16 * 1024;

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** POST /api/quizzes — 퀴즈 생성. body: { nickname, answers } */
export async function POST(req: NextRequest) {
  // rate-limit: IP당 분 10회 (메모리 카운터, 운영은 Redis 권장)
  if (!checkRateLimit(`quiz-create:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "요청 본문이 너무 큽니다." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { nickname, answers } = (body ?? {}) as { nickname?: unknown; answers?: unknown };

  const nickCheck = validateNickname(nickname);
  if (!nickCheck.ok) return NextResponse.json({ error: nickCheck.error }, { status: 400 });
  const ansCheck = validateAnswers(answers);
  if (!ansCheck.ok) return NextResponse.json({ error: ansCheck.error }, { status: 400 });

  const { token: ownerToken, hash: ownerTokenHash } = generateOwnerToken();

  // publicId 충돌 시 재시도
  let publicId = "";
  for (let i = 0; i < 5; i++) {
    const candidate = generatePublicId(6);
    const exists = await db.quiz.findUnique({ where: { publicId: candidate }, select: { id: true } });
    if (!exists) {
      publicId = candidate;
      break;
    }
  }
  if (!publicId) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  const quiz = await db.quiz.create({
    data: {
      publicId,
      ownerTokenHash,
      nickname: normalizeNickname(nickname as string),
      answers: {
        create: (answers as { questionId: number; selectedOption: number }[]).map((a) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
        })),
      },
    },
    select: { publicId: true },
  });

  // ownerToken 원문은 DB에 저장하지 않고 응답으로만 반환
  return NextResponse.json({ publicId: quiz.publicId, ownerToken }, { status: 201 });
}
