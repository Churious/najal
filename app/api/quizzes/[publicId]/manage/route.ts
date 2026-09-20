import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import db from "@/lib/db";
import { verifyOwnerToken } from "@/lib/owner-token";
import {
  familiarityIndex,
  mostMisunderstoodQuestion,
  questionDistributions,
} from "@/lib/statistics";
import { validatePublicId } from "@/lib/validation";

/**
 * GET /api/quizzes/:publicId/manage
 * ownerToken은 URL query로 받지 않고 header x-owner-token 으로만 받는다.
 */
export async function GET(req: NextRequest, { params }: { params: { publicId: string } }) {
  const idCheck = validatePublicId(params.publicId);
  if (!idCheck.ok) return NextResponse.json({ error: idCheck.error }, { status: 400 });

  const token = req.headers.get("x-owner-token");
  if (!token) return NextResponse.json({ error: "관리자 토큰이 필요합니다." }, { status: 401 });

  const quiz = await db.quiz.findUnique({
    where: { publicId: params.publicId },
    select: {
      id: true,
      nickname: true,
      publicId: true,
      ownerTokenHash: true,
      participants: {
        select: { id: true, nickname: true, score: true, createdAt: true },
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!quiz) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
  if (!verifyOwnerToken(token, quiz.ownerTokenHash)) {
    return NextResponse.json({ error: "관리자 토큰이 올바르지 않습니다." }, { status: 403 });
  }

  const participantIds = quiz.participants.map((p) => p.id);
  const allAnswers =
    participantIds.length === 0
      ? []
      : await db.participantAnswer.findMany({
          where: { participantId: { in: participantIds } },
          select: { questionId: true, selectedOption: true, isCorrect: true },
        });

  const totalParticipants = quiz.participants.length;
  const scores = quiz.participants.map((p) => p.score);
  const average = totalParticipants === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / totalParticipants) * 10) / 10;
  const max = totalParticipants === 0 ? 0 : Math.max(...scores);

  const distributions = questionDistributions(allAnswers).map((d) => ({
    ...d,
    questionText: QUESTIONS[d.questionId]?.text ?? "",
  }));
  const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
  const familiarity = familiarityIndex(totalCorrect, allAnswers.length);
  const misunderstood = mostMisunderstoodQuestion(distributions);
  const mostMisunderstood = misunderstood
    ? {
        questionId: misunderstood.questionId,
        questionText: QUESTIONS[misunderstood.questionId]?.text ?? "",
        correctRate: misunderstood.correctRate,
      }
    : null;

  return NextResponse.json({
    nickname: quiz.nickname,
    publicId: quiz.publicId,
    totalParticipants,
    average,
    max,
    leaderboard: quiz.participants,
    distributions,
    familiarity,
    mostMisunderstood,
  });
}
