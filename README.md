# CastCanvas Lab — Collaboration Server

CastCanvas Lab은 공간 기반 리서치 워크스페이스입니다.
PDF 문서와 레퍼런스 이미지를 무한 캔버스 위에 자유롭게 배치하고, 노트와 연결선으로 아이디어를 연결할 수 있습니다.

> Notion보다 더 공간적으로, Figma보다 더 문서 친화적으로.

---

## 서비스 구성

CastCanvas Lab은 다음 레포지토리로 구성됩니다.

| 레포                     | 역할                                 |
| ------------------------ | ------------------------------------ |
| `cast-canvas-lab-fe`     | 워크스페이스 프론트엔드 앱           |
| `cast-canvas-lab-be`     | 메인 백엔드 API 서버                 |
| `cast-canvas-lab-collab` | 실시간 협업 서버 (이 레포)           |
| `cast-canvas-lab-site`   | 퍼블릭 랜딩 사이트                   |

시스템 전체 구조와 레포 간 책임 경계는 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

---

## 기술 스택

| 항목 | 버전 / 내용 |
| ---- | ----------- |
| Node.js | 25.x 기준 개발 중 |
| Package Manager | pnpm 10.30.3 |
| Language | TypeScript 5.9.x |
| Framework | NestJS 11 |
| WebSocket | `@nestjs/platform-ws`, `ws` |
| Collaboration | Yjs, `y-protocols` |
| Test | Jest, ts-jest |
| Code Quality | Biome 2.4.6 |
| Git Hooks | Husky, lint-staged, commitlint |

---

## 로컬 개발 환경 설정

**요구 사항:** Node.js, pnpm

**1. 의존성 설치**

```bash
pnpm install
```

**2. 개발 서버 실행**

```bash
pnpm dev
```

기본 접속 정보:

| 항목 | 값 |
| ---- | -- |
| App | `http://localhost:3001` |
| Health | `http://localhost:3001/health` |
| WebSocket Path | `/collab` |

---

## 주요 명령어

| 명령어                  | 설명                        |
| ----------------------- | --------------------------- |
| `pnpm dev`              | 개발 서버 실행              |
| `pnpm build`            | TypeScript 빌드             |
| `pnpm test`             | 테스트 실행                 |
| `pnpm test:watch`       | 테스트 감시 모드            |
| `pnpm test:cov`         | 테스트 커버리지 실행        |
| `pnpm check`            | Biome 검사                  |
| `pnpm check:write`      | Biome 자동 수정 포함 검사   |
| `pnpm format`           | 코드 포맷 적용              |
| `pnpm check:branch`     | 브랜치 네이밍 규칙 검사     |
| `pnpm check:no-secrets` | 스테이징 파일의 시크릿 검사 |

---

## 프로젝트 구조

```text
src/
├── auth/
│   └── infrastructure/   # 인증 연동 구현체
├── collaboration/
│   ├── application/      # join/update/awareness/disconnect 유스케이스
│   ├── domain/           # room, connection, lifecycle state
│   ├── infrastructure/   # persistence 등 외부 연동
│   └── presentation/     # websocket gateway, message mapping
├── health/               # health check
├── app.module.ts
└── main.ts
```

현재 구조는 메인 백엔드 레포의 `domain / application / presentation / infrastructure` 패턴을 참고하되, collab 서버 책임에 맞게 `collaboration` 중심으로 단순화한 DDD-lite 구조를 따릅니다.

---

## 코드 기여 규칙

- 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다
- 브랜치 네이밍 규칙은 커밋 전 자동으로 검사됩니다
- 커밋 시 staged 파일에 대해 Biome 자동 수정이 실행됩니다
- push 전 `check`, `test`, `build`가 자동으로 실행됩니다
- `any` 사용은 피하고 타입을 명시적으로 유지하세요
- Yjs 문서 상태와 awareness 상태는 분리해서 다루세요
- transport, application, domain, infrastructure 경계를 섞지 마세요
