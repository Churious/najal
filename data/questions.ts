export interface Question {
  id: number;
  text: string;
  options: [string, string, string, string];
}

export const QUESTION_COUNT = 10;
export const POINTS_PER_QUESTION = 10;
export const MAX_SCORE = QUESTION_COUNT * POINTS_PER_QUESTION;

export const QUESTIONS: Question[] = [
  { id: 0, text: "갑자기 3일 휴가가 생긴다면?", options: ["집에서 쉰다", "여행 간다", "친구를 만난다", "그날 생각한다"] },
  { id: 1, text: "연락할 때 나는?", options: ["전화가 편하다", "카톡이 편하다", "만나서 말하는 게 편하다", "연락을 자주 안 한다"] },
  { id: 2, text: "갑자기 100만원이 생기면?", options: ["여행", "전자기기", "저축", "쇼핑"] },
  { id: 3, text: "약속 스타일은?", options: ["무조건 미리 계획", "중요한 것만 계획", "거의 즉흥", "상황에 따라 다름"] },
  { id: 4, text: "주말에 가장 하고 싶은 것은?", options: ["집에서 쉬기", "친구 만나기", "쇼핑", "놀러 가기"] },
  { id: 5, text: "여행 스타일은?", options: ["계획표 필수", "큰 일정만 정한다", "거의 즉흥", "다른 사람 따라간다"] },
  { id: 6, text: "스트레스 받을 때 나는?", options: ["혼자 있는다", "친구에게 말한다", "먹는다", "잔다"] },
  { id: 7, text: "선물 받을 때 가장 좋은 것은?", options: ["실용적인 것", "먹을 것", "갖고 싶던 것", "직접 만든 것"] },
  { id: 8, text: "친구가 갑자기 나오라고 하면?", options: ["바로 나간다", "고민하다 나간다", "미리 말해야 한다", "거의 안 나간다"] },
  { id: 9, text: "나는 스스로 생각하기에?", options: ["완전 계획형", "약간 계획형", "약간 즉흥형", "완전 즉흥형"] },
];

export function getQuestion(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
