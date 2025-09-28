# CastCanvas Lab Collaboration Server

CastCanvas Lab은 PDF 문서, 이미지, 노트를 하나의 무한 캔버스 위에서 연결해 리서치 흐름을 정리하는 공간형 워크스페이스입니다.

> Notion보다 더 공간적으로, Figma보다 더 문서 친화적으로.

## 프로젝트 개요

CastCanvas Lab은 아래 4개 레포지토리로 구성됩니다.

| 레포 | 역할 |
| --- | --- |
| `cast-canvas-lab-fe` | 워크스페이스 프론트엔드 |
| `cast-canvas-lab-be` | 메인 백엔드 API 서버 |
| `cast-canvas-lab-collab` | 실시간 협업 서버 |
| `cast-canvas-lab-site` | 퍼블릭 랜딩 사이트 |

시스템 경계와 레포 간 책임은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 기준으로 유지합니다.

## 이 레포의 역할

`cast-canvas-lab-collab`는 캔버스 편집 상태를 여러 사용자 사이에서 동기화하는 실시간 협업 서버입니다. Yjs 문서 상태와 awareness 상태를 WebSocket으로 전달하고, 연결 수명주기와 인증 검증 지점을 처리합니다.

이 레포가 담당하는 범위:

- 협업 세션 연결 및 연결 수명주기 관리
- Yjs 업데이트 브로드캐스트
- awareness 상태 전달
- 협업 접속 전 인증 검증 지점 제공
- 상태 동기화용 WebSocket 엔드포인트 제공

이 레포가 담당하지 않는 범위:

- 사용자-facing HTTP 비즈니스 API
- 브라우저 UI와 캔버스 렌더링
- 퍼블릭 마케팅 페이지

## 기술 스택

| 항목 | 내용 |
| --- | --- |
| Runtime | Node.js |
| Package Manager | pnpm 10.30.3 |
| Language | TypeScript 5.9.x |
| Framework | NestJS 11 |
| Transport | WebSocket (`@nestjs/platform-ws`, `ws`) |
| Collaboration | Yjs, `y-protocols` |
| Test | Jest, ts-jest |
| Quality | Biome |

## 시작하기

요구 사항:

- Node.js
- pnpm

1. 의존성을 설치합니다.

```bash
pnpm install
```

2. 개발 서버를 실행합니다.

```bash
pnpm dev
```

기본 로컬 접속 정보:

| 항목 | 값 |
| --- | --- |
| App | `http://localhost:3001` |
| Health | `http://localhost:3001/health` |
| WebSocket Path | `/collab` |

## 주요 명령어

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | TypeScript 빌드 |
| `pnpm test` | 테스트 실행 |
| `pnpm test:watch` | 테스트 watch 모드 |
| `pnpm test:cov` | 테스트 커버리지 실행 |
| `pnpm check` | Biome 검사 |
| `pnpm check:write` | Biome 검사 및 자동 수정 |
| `pnpm format` | 포맷 적용 |

## 프로젝트 구조

```text
src/
├── auth/
│   └── infrastructure/   # 인증 연동 구현체
├── collaboration/
│   ├── application/      # join/update/awareness/disconnect 유스케이스
│   ├── domain/           # room, connection, lifecycle state
│   ├── infrastructure/   # persistence, external integration
│   └── presentation/     # websocket gateway, message mapping
├── health/               # health check
├── app.module.ts
└── main.ts
```

구조는 백엔드 레포의 레이어 분리를 참고하되, collab 서버 책임에 맞게 `collaboration` 중심으로 단순화되어 있습니다.

## 협업 규칙

- 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 사용합니다.
- 코드 수정 후 `pnpm check`와 `pnpm test`로 기본 품질을 확인합니다.
- `any` 남용을 피하고 메시지 타입을 명시적으로 유지합니다.
- Yjs 문서 상태와 awareness 상태는 분리해서 다룹니다.
- transport, application, domain, infrastructure 경계를 섞지 않습니다.
