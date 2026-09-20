import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { gradeAnswers, scoreMessage } from "@/lib/scoring";
import { normalizeNickname, validateAnswers, validateNickname, validatePublicId } from "@/lib/validation";

const MAX_BODY_BYTES = 16 * 1024;

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** GET /api/quizzes/:publicId — 퀴즈 공개 정보 (출제자 닉네임) */
export async function GET(_req: NextRequest, { params }: { params: { publicId: string } }) {
  const idCheck = validatePublicId(params.publicId);
  if (!idCheck.ok) return NextResponse.json({ error: idCheck.error }, { status: 400 });

  const quiz = await db.quiz.findUnique({
    where: { publicId: params.publicId },
    select: { publicId: true, nickname: true },
  });
  if (!quiz) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json(quiz);
}

/** POST /api/quizzes/:publicId/participants — 참가 제출 + 채점 */
export async function POST(req: NextRequest, { params }: { params: { publicId: string } }) {
  // rate-limit: IP당 분 20회 (메모리 카운터, 운영은 Redis 권장)
  if (!checkRateLimit(`participate:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const idCheck = validatePublicId(params.publicId);
  if (!idCheck.ok) return NextResponse.json({ error: idCheck.error }, { status: 400 });

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

  const quiz = await db.quiz.findUnique({
    where: { publicId: params.publicId },
    select: { id: true, answers: { select: { questionId: true, selectedOption: true } } },
  });
  if (!quiz) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });

  const correct = new Map(quiz.answers.map((a) => [a.questionId, a.selectedOption]));
  const submitted = answers as { questionId: number; selectedOption: number }[];
  const { score, correctCount } = gradeAnswers(submitted, correct);

  const participant = await db.participant.create({
    data: {
      quizId: quiz.id,
      nickname: normalizeNickname(nickname as string),
      score,
      answers: {
        create: submitted.map((a) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: correct.get(a.questionId) === a.selectedOption,
        })),
      },
    },
    select: { id: true, score: true },
  });

  return NextResponse.json(
    { participantId: participant.id, score: participant.score, correctCount, message: scoreMessage(score) },
    { status: 201 },
  );
}
