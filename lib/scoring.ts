import { MAX_SCORE, POINTS_PER_QUESTION, QUESTION_COUNT } from "@/data/questions";

export { POINTS_PER_QUESTION, QUESTION_COUNT, MAX_SCORE };

export interface AnswerInput {
  questionId: number;
  selectedOption: number;
}

export interface GradeResult {
  score: number;
  correctCount: number;
}

/** 10문제 각 10점. correct: questionId -> 정답 option 인덱스 */
export function gradeAnswers(
  answers: AnswerInput[],
  correct: Map<number, number> | Record<number, number>,
): GradeResult {
  const map = correct instanceof Map ? correct : new Map(Object.entries(correct).map(([k, v]) => [Number(k), v]));
  let correctCount = 0;
  for (const a of answers) {
    if (map.get(a.questionId) === a.selectedOption) correctCount++;
  }
  return { score: correctCount * POINTS_PER_QUESTION, correctCount };
}

/** 점수 문구. 상처를 주는 표현 없이 격려 위주로 작성할 것. */
export function scoreMessage(score: number): string {
  if (score >= 100) return "인간 나무위키! 나에 대해 모르는 게 없네요";
  if (score >= 90) return "진정한 나잘알! 거의 다 알고 있어요";
  if (score >= 80) return "나를 꽤 잘 알고 있음! 조금만 더 가까워져 봐요";
  if (score >= 70) return "나와 제법 친함! 아직 알아갈 게 남았어요";
  if (score >= 50) return "아직 알아가는 중! 함께 시간을 더 보내봐요";
  if (score >= 30) return "생각보다 모르는 게 많음! 나에 대해 더 물어봐 주세요";
  return "다시 알아가야 할지도! 처음부터 차근차근 알아가 봐요";
}
