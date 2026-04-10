# A/B Testing Tool

간단한 A/B 테스트 관리 도구. 실험을 생성하고, 트래픽 비율을 설정하면 디바이스(device_id) 기준으로 자동으로 A/B 변형에 배정됩니다.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS

## Getting Started

### 1. Prerequisites

- Node.js 20+
- Docker (PostgreSQL 실행용)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start PostgreSQL (Docker)

```bash
docker run -d \
  --name ab_testing_pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ab_testing \
  -p 5434:5432 \
  postgres:16-alpine
```

### 4. Environment Variables

`.env` 파일을 프로젝트 루트에 생성:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/ab_testing?schema=public"
API_KEY="your-public-api-key"
ADMIN_KEY="your-admin-key"
```

> **주의**: Production 배포 시 반드시 `API_KEY`와 `ADMIN_KEY`를 강력한 값으로 변경하세요.

### 5. Database Migration

```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Run Dev Server

```bash
npm run dev
```

## Authentication

### 관리 UI

브라우저에서 접속하면 로그인 페이지가 표시됩니다. `ADMIN_KEY`를 입력하면 7일간 세션이 유지됩니다.

### API 인증

모든 API 요청에 `x-api-key` 헤더가 필요합니다.

| 대상 | 허용 키 |
|------|--------|
| `/api/assign` (공개 API) | `API_KEY` 또는 `ADMIN_KEY` |
| `/api/experiments/*` (관리 API) | `ADMIN_KEY` |
| `/api/docs`, `/api/auth/*` | 인증 불필요 |

## API Endpoints

### Public API (외부 서비스 연동용)

#### `GET /api/assign`

디바이스를 실험의 A/B 변형에 자동 배정합니다. 이미 배정된 디바이스는 동일한 변형을 반환합니다.

```bash
curl "https://your-domain/api/assign?key=homepage-cta-test&deviceId=device-abc-123" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response:**

```json
{
  "variant": "A",
  "label": "Blue Button",
  "value": { "color": "blue" }
}
```

### Management API

#### `GET /api/experiments`

실험 목록을 조회합니다.

#### `POST /api/experiments`

새 실험을 생성합니다.

```json
{
  "name": "Homepage CTA Test",
  "key": "homepage-cta-test",
  "description": "CTA 버튼 색상 테스트",
  "ratioA": 50,
  "variantALabel": "Blue Button",
  "variantAValue": "{\"color\": \"blue\"}",
  "variantBLabel": "Red Button",
  "variantBValue": "{\"color\": \"red\"}"
}
```

#### `PATCH /api/experiments/:id`

실험 설정을 변경합니다 (비율, 변형 설정, 활성 상태 등).

#### `DELETE /api/experiments/:id`

실험과 모든 배정 데이터를 삭제합니다.

#### `POST /api/experiments/:id/assign`

실험 ID 기반으로 디바이스를 배정합니다.

```json
{ "deviceId": "device-abc-123" }
```

### Swagger

`/docs` 페이지에서 전체 API 문서를 확인할 수 있습니다.

## 외부 서비스 연동 예시

```typescript
// 1. A/B 배정 받기 (device_id 기준)
const res = await fetch(
  `https://ab-test.your-domain.com/api/assign?key=homepage-cta-test&deviceId=${deviceId}`,
  { headers: { "x-api-key": process.env.AB_TEST_API_KEY } }
);
const { variant, label, value } = await res.json();

// 2. Amplitude 등 분석 도구에 기록
amplitude.track("Experiment Exposed", {
  experiment_key: "homepage-cta-test",
  variant,
  variant_label: label,
  device_id: deviceId,
});

// 3. UI 분기
<button style={{ backgroundColor: value.color }}>상담 신청</button>
```

## Production 배포

### Vercel 배포

1. GitHub 레포 연결
2. Environment Variables 설정 (`DATABASE_URL`, `API_KEY`, `ADMIN_KEY`)
3. Build command는 기본값 사용 (`next build`)
4. `package.json`의 build 스크립트 수정 권장:

```json
"build": "prisma migrate deploy && prisma generate && next build"
```

### Production 체크리스트

- [ ] PostgreSQL 인스턴스 준비 (AWS RDS, Supabase, Neon 등)
- [ ] `DATABASE_URL`이 production DB를 가리키는지 확인
- [ ] `API_KEY`, `ADMIN_KEY`를 강력한 랜덤 값으로 변경
- [ ] 커스텀 도메인 연결
- [ ] `/docs` 페이지 접근 제한 고려

## Data Model

```
Experiment
├── id          (UUID)
├── key         (unique, URL-safe)
├── name
├── description
├── ratioA      (0-100, Variant A 비율)
├── variantALabel / variantAValue
├── variantBLabel / variantBValue
├── active
└── assignments[]

Assignment
├── id          (UUID)
├── experimentId
├── deviceId
├── variant     ("A" or "B")
└── assignedAt
```

`[experimentId, deviceId]` 조합은 unique — 같은 디바이스는 같은 실험에서 항상 같은 변형을 받습니다.
