import { QUESTION_COUNT } from "@/data/questions";

export interface AnswerInput {
  questionId: number;
  selectedOption: number;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;
const PUBLIC_ID_RE = /^[A-Za-z0-9]{6}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** 닉네임: trim 후 2~12자 */
export function validateNickname(nickname: unknown): ValidationResult {
  if (typeof nickname !== "string") return { ok: false, error: "닉네임은 문자열이어야 합니다." };
  const name = nickname.trim();
  if (name.length < NICKNAME_MIN || name.length > NICKNAME_MAX) {
    return { ok: false, error: `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자여야 합니다.` };
  }
  return { ok: true };
}

export function normalizeNickname(nickname: string): string {
  return nickname.trim();
}

/** answers: 10개, questionId 0~9 중복 없이 전부, option 0~3 */
export function validateAnswers(answers: unknown): ValidationResult {
  if (!Array.isArray(answers)) return { ok: false, error: "answers는 배열이어야 합니다." };
  if (answers.length !== QUESTION_COUNT) {
    return { ok: false, error: `답변은 ${QUESTION_COUNT}개여야 합니다.` };
  }
  const seen = new Set<number>();
  for (const a of answers) {
    if (typeof a !== "object" || a === null) return { ok: false, error: "답변 형식이 올바르지 않습니다." };
    const { questionId, selectedOption } = a as Record<string, unknown>;
    if (!Number.isInteger(questionId) || (questionId as number) < 0 || (questionId as number) >= QUESTION_COUNT) {
      return { ok: false, error: "questionId 범위가 올바르지 않습니다." };
    }
    if (!Number.isInteger(selectedOption) || (selectedOption as number) < 0 || (selectedOption as number) > 3) {
      return { ok: false, error: "선택지 범위가 올바르지 않습니다." };
    }
    if (seen.has(questionId as number)) return { ok: false, error: "중복된 questionId가 있습니다." };
    seen.add(questionId as number);
  }
  return { ok: true };
}

/** publicId: 6자 영숫자 */
export function validatePublicId(publicId: unknown): ValidationResult {
  if (typeof publicId !== "string" || !PUBLIC_ID_RE.test(publicId)) {
    return { ok: false, error: "퀴즈 주소를 확인해 주세요." };
  }
  return { ok: true };
}

/** participantId: cuid 계열 문자열 */
export function validateParticipantId(participantId: unknown): ValidationResult {
  if (typeof participantId !== "string" || !ID_RE.test(participantId)) {
    return { ok: false, error: "참가자 정보를 확인해 주세요." };
  }
  return { ok: true };
}
