/**
 * 간단 메모리 카운터 rate-limit.
 * NOTE: 단일 프로세스 기준. 운영(복수 인스턴스)에서는 Redis 등 외부 저장소로 교체할 것.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || cur.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  cur.count++;
  if (cur.count > limit) return false;
  return true;
}

/** 가벼운 주기 정리 (메모리 누수 방지) */
setInterval(() => {
  const now = Date.now();
  buckets.forEach((v, k) => {
    if (v.resetAt <= now) buckets.delete(k);
  });
}, 60_000).unref?.();
