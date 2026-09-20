# 나잘알 — 친구들은 나를 얼마나 알고 있을까?

10개 질문으로 만드는 "나를 맞히는 퀴즈" MVP. 출제자가 정답을 고르면 공유 링크가 생기고,
친구들은 회원가입 없이 풀고 점수·순위·틀린 문제를 확인한다.

## 기능

- 퀴즈 만들기: 닉네임 입력 → 10문제 정답 선택 → 공유 링크 + 관리자 토큰 발급
- 참가하기: `/t/{publicId}` → 닉네임 → 한 문제씩 풀이 → 점수/문구/순위/틀린 문제
- 리더보드: 점수 내림차순, 동점은 먼저 참여한 사람이 위
- 관리 페이지: `/manage/{publicId}` (관리자 토큰 필요) — 총 참가자/평균/최고/리더보드/질문별 분포/나잘알도/가장 오해받은 질문
- 점수 문구: 100 인간 나무위키 / 90 나잘알 / 80 꽤 잘 알고 있음 / 70 제법 친함 / 50-60 알아가는 중 / 30-40 모르는 게 많음 / 0-20 다시 알아가야 할지도

## 스택

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma · PostgreSQL 17 · Caddy

## 로컬 개발

```bash
cp .env.example .env
# DATABASE_URL을 로컬 Postgres에 맞게 수정 (예: postgresql://user:pass@localhost:5432/najal)

npm install
npx prisma migrate dev   # 첫 migration 적용 + client 생성
npm run dev              # http://localhost:3000
```

## 환경 변수 (.env)

| 변수 | 설명 |
| --- | --- |
| `POSTGRES_DB/USER/PASSWORD` | Docker Postgres 계정 |
| `DATABASE_URL` | Prisma 접속 URL |
| `NEXT_PUBLIC_APP_URL` | 공유 링크 기준 URL |
| `SITE_DOMAIN` | Caddy 도메인 |

## Docker로 실행

```bash
cp .env.example .env   # 값 채우기
docker compose up -d --build
docker compose logs -f web
```

- `web` healthcheck: `/api/health` (DB `SELECT 1` 확인)
- `postgres` healthcheck: `pg_isready`, 5432는 외부에 노출하지 않음 (80/443만 노출)

## Migration

```bash
npx prisma migrate dev --name <변경내용>   # 개발: migration 생성 + 적용
npx prisma migrate deploy                  # 운영: 적용만 (entrypoint에서 자동 실행)
```

## 업데이트

```bash
docker compose build web
docker compose up -d web
```

## 백업 / 복원

```bash
# 백업
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
# 복원
cat backup.sql | docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

## 구조

```
app/
  page.tsx                    홈 (헤드라인 + CTA)
  create/page.tsx             만들기 (닉네임 → 10문제)
  created/[publicId]/page.tsx 공유 링크 + 내 결과 보기
  t/[publicId]/page.tsx       참가 입장 (닉네임)
  t/[publicId]/play/page.tsx  풀이 화면
  t/[publicId]/result/[participantId]/page.tsx 결과
  manage/[publicId]/page.tsx  관리자 통계
  api/
    health/route.ts
    quizzes/route.ts                          POST 생성
    quizzes/[publicId]/route.ts               GET 공개 정보
    quizzes/[publicId]/participants/route.ts  POST 참가+채점
    quizzes/[publicId]/leaderboard/route.ts   GET 리더보드
    quizzes/[publicId]/result/[participantId]/route.ts
    quizzes/[publicId]/manage/route.ts        GET 통계 (x-owner-token)
data/questions.ts   기본 10문제
lib/                db · owner-token · scoring · statistics · validation · rate-limit
prisma/             schema.prisma + migrations
Dockerfile · docker-compose.yml · Caddyfile · entrypoint.sh
```
