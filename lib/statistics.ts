import { QUESTION_COUNT } from "@/data/questions";

export interface QuestionDistribution {
  questionId: number;
  /** 옵션 인덱스별 선택 수 [o0, o1, o2, o3] */
  counts: [number, number, number, number];
  total: number;
  correctCount: number;
  correctRate: number;
}

export interface ParticipantAnswerLike {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}

/** 질문별 분포 집계 */
export function questionDistributions(
  answers: ParticipantAnswerLike[],
  questionIds: number[] = Array.from({ length: QUESTION_COUNT }, (_, i) => i),
): QuestionDistribution[] {
  return questionIds.map((questionId) => {
    const counts: [number, number, number, number] = [0, 0, 0, 0];
    let correctCount = 0;
    let total = 0;
    for (const a of answers) {
      if (a.questionId !== questionId) continue;
      if (a.selectedOption >= 0 && a.selectedOption < 4) counts[a.selectedOption as 0 | 1 | 2 | 3]++;
      if (a.isCorrect) correctCount++;
      total++;
    }
    return {
      questionId,
      counts,
      total,
      correctCount,
      correctRate: total === 0 ? 0 : (correctCount / total) * 100,
    };
  });
}

/** 나잘알도 = 전체 정답 수 / 전체 답변 수 * 100 */
export function familiarityIndex(totalCorrect: number, totalAnswers: number): number {
  if (totalAnswers === 0) return 0;
  return Math.round((totalCorrect / totalAnswers) * 1000) / 10;
}

/** 가장 오해받은 질문 = 정답률이 가장 낮은 질문 (답변 없는 질문 제외, 동률은 id 오름차순) */
export function mostMisunderstoodQuestion(
  distributions: QuestionDistribution[],
): QuestionDistribution | null {
  const answered = distributions.filter((d) => d.total > 0);
  if (answered.length === 0) return null;
  return answered.reduce((min, d) =>
    d.correctRate < min.correctRate ||
    (d.correctRate === min.correctRate && d.questionId < min.questionId)
      ? d
      : min,
  );
}
