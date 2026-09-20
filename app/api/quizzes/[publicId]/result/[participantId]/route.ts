import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import db from "@/lib/db";
import { scoreMessage } from "@/lib/scoring";
import { validateParticipantId, validatePublicId } from "@/lib/validation";

/** GET /api/quizzes/:publicId/result/:participantId — 점수+문구+순위+맞힌개수+틀린문제 목록 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { publicId: string; participantId: string } },
) {
  const idCheck = validatePublicId(params.publicId);
  if (!idCheck.ok) return NextResponse.json({ error: idCheck.error }, { status: 400 });
  const pCheck = validateParticipantId(params.participantId);
  if (!pCheck.ok) return NextResponse.json({ error: pCheck.error }, { status: 400 });

  const quiz = await db.quiz.findUnique({
    where: { publicId: params.publicId },
    select: {
      id: true,
      nickname: true,
      answers: { select: { questionId: true, selectedOption: true } },
    },
  });
  if (!quiz) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });

  const participant = await db.participant.findFirst({
    where: { id: params.participantId, quizId: quiz.id },
    select: {
      id: true,
      nickname: true,
      score: true,
      createdAt: true,
      answers: { select: { questionId: true, selectedOption: true, isCorrect: true } },
    },
  });
  if (!participant) return NextResponse.json({ error: "참가자를 찾을 수 없습니다." }, { status: 404 });

  const correct = new Map(quiz.answers.map((a) => [a.questionId, a.selectedOption]));
  const optionText = (questionId: number, opt: number) => QUESTIONS[questionId]?.options[opt] ?? "";

  const correctCount = participant.answers.filter((a) => a.isCorrect).length;
  const wrongAnswers = participant.answers
    .filter((a) => !a.isCorrect)
    .sort((a, b) => a.questionId - b.questionId)
    .map((a) => ({
      questionId: a.questionId,
      questionText: QUESTIONS[a.questionId]?.text ?? "",
      guessed: optionText(a.questionId, a.selectedOption),
      actual: optionText(a.questionId, correct.get(a.questionId) ?? -1),
    }));

  // 순위: 나보다 (점수 높거나, 동점이면서 먼저 참여한) 사람 수 + 1
  const ahead = await db.participant.count({
    where: {
      quizId: quiz.id,
      OR: [
        { score: { gt: participant.score } },
        { score: participant.score, createdAt: { lt: participant.createdAt } },
      ],
    },
  });
  const totalParticipants = await db.participant.count({ where: { quizId: quiz.id } });

  return NextResponse.json({
    nickname: participant.nickname,
    ownerNickname: quiz.nickname,
    score: participant.score,
    message: scoreMessage(participant.score),
    rank: ahead + 1,
    totalParticipants,
    correctCount,
    totalQuestions: quiz.answers.length,
    wrongAnswers,
  });
}
