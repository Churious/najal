import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validatePublicId } from "@/lib/validation";

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
