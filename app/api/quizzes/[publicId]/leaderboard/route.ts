import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validatePublicId } from "@/lib/validation";

/** GET /api/quizzes/:publicId/leaderboard — nickname+score+createdAt, 동점은 먼저 참여한 사람이 위 */
export async function GET(_req: NextRequest, { params }: { params: { publicId: string } }) {
  const idCheck = validatePublicId(params.publicId);
  if (!idCheck.ok) return NextResponse.json({ error: idCheck.error }, { status: 400 });

  const quiz = await db.quiz.findUnique({
    where: { publicId: params.publicId },
    select: { id: true },
  });
  if (!quiz) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });

  const leaderboard = await db.participant.findMany({
    where: { quizId: quiz.id },
    select: { id: true, nickname: true, score: true, createdAt: true },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ leaderboard });
}
