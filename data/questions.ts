export interface Question {
  id: number;
  text: string;
  options: [string, string, string, string];
}

export const QUESTION_COUNT = 10;
export const POINTS_PER_QUESTION = 10;
export const MAX_SCORE = QUESTION_COUNT * POINTS_PER_QUESTION;

export const QUESTIONS: Question[] = [
  { id: 0, text: "나의 MBTI는?", options: ["E (외향형)", "I (내향형)", "잘 모르겠음", "MBTI에 관심 없음"] },
  { id: 1, text: "내가 가장 좋아하는 음식은?", options: ["한식", "중식", "일식", "양식"] },
  { id: 2, text: "나의 생일이 속한 계절은?", options: ["봄", "여름", "가을", "겨울"] },
  { id: 3, text: "내가 가장 좋아하는 색은?", options: ["파랑", "빨강", "검정", "초록"] },
  { id: 4, text: "주말에 나는 주로 무엇을 할까?", options: ["집에서 쉬기", "친구 만나기", "운동하기", "여행 가기"] },
  { id: 5, text: "내가 가장 자주 듣는 음악 장르는?", options: ["K-POP", "힙합", "발라드", "록"] },
  { id: 6, text: "내가 가장 가고 싶은 여행지는?", options: ["일본", "유럽", "동남아", "제주도"] },
  { id: 7, text: "나의 혈액형은?", options: ["A형", "B형", "O형", "AB형"] },
  { id: 8, text: "내가 가장 좋아하는 계절은?", options: ["봄", "여름", "가을", "겨울"] },
  { id: 9, text: "스트레스를 받으면 나는?", options: ["맛있는 걸 먹는다", "잠을 잔다", "친구에게 털어놓는다", "운동으로 해소한다"] },
];

export function getQuestion(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
