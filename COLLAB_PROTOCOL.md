# CastCanvas Lab Collab — Protocol Guide

## 1. Purpose

This document defines repository-local collaboration rules for `cast-canvas-lab-collab`.

Use this file for:
- room lifecycle decisions
- Yjs sync flow decisions
- awareness handling decisions
- persistence boundary decisions
- auth and permission behavior within the collaboration server

Use `ARCHITECTURE.md` for:
- cross-repository ownership
- FE / BE / COLLAB / SITE boundaries
- system-level integration flows

## 2. Core model

The collaboration server owns explicit real-time synchronization state for a shared canvas document.

Core state concepts:
- `room`: server-side session container keyed by stable workspace/document identifiers
- `document state`: Yjs `Y.Doc` plus metadata required for sync lifecycle
- `awareness state`: presence information managed separately from document content
- `connection state`: authenticated socket session metadata and room membership

Document state and awareness state must remain distinct concerns.

## 3. Stable identifiers

- A room identifier must be deterministic and derived from backend-owned workspace/document identity
- Do not invent client-only temporary room identifiers for shared persisted sessions
- Connection identifiers should be unique per socket session
- User identifiers and authorization context must come from validated backend-authenticated identity

## 4. Expected lifecycle

Canonical lifecycle:
1. client opens WebSocket connection
2. server validates authentication context
3. server validates workspace/document access
4. server resolves room identifier
5. server creates or loads room state
6. server joins connection to room
7. server performs initial sync using Yjs state-vector-based flow
8. server accepts incremental document updates from authorized writers
9. server broadcasts incremental updates to other room peers
10. server accepts and broadcasts awareness updates
11. disconnect removes connection membership and presence
12. empty room may be persisted and cleaned up

Lifecycle transitions should stay explicit in code. Avoid hidden joins, implicit room creation, or side effects spread across unrelated modules.

## 5. Authentication and authorization

- Authentication must be explicit during connection establishment or room join
- Authorization must be checked against workspace/document access, not just connection existence
- The design must support read-only and read-write roles
- A connected user must not automatically be treated as a writer
- Mutation paths must reject unauthorized updates explicitly

If the backend is the source of truth for access, the collaboration server should validate against that contract clearly and consistently.

## 6. Initial sync rules

- Initial sync must use Yjs-compatible state vector and update exchange semantics
- A joining client should receive the current room document state before normal steady-state collaboration
- If persisted state exists, it must be loaded before or during join in a way that preserves update semantics
- Avoid ad hoc JSON snapshots as the primary collaboration source of truth

## 7. Incremental update rules

- Incremental document updates are binary Yjs updates
- Apply incoming updates to the room document state first, then fan out to relevant peers
- Avoid rebroadcasting updates to the originating connection unless the protocol path requires it
- Broadcast only within the same resolved room
- Update handling should remain separate from awareness handling

## 8. Awareness rules

- Awareness state is ephemeral presence state, not durable document content
- Awareness join, update, and leave handling must be explicit
- Disconnect must remove presence for the departed connection
- Awareness broadcasting should remain lightweight and room-scoped
- Do not persist awareness as if it were durable collaborative content

## 9. Persistence boundary

- Persistence is a boundary around Yjs update data, not a license to flatten collaboration state into ordinary JSON
- Prefer durable storage strategies compatible with replay, merge, or restore of binary updates
- Loading persisted state must restore the shared document state without changing the sync contract
- Room cleanup and persistence timing should be explicit and testable

## 10. Transport and module boundaries

- Keep transport-level WebSocket handling distinct from room/document state management
- Keep auth validation distinct from Yjs document mutation logic
- Keep awareness utilities distinct from document update utilities
- Avoid leaking socket concerns into persistence code

## 11. Testing expectations

The following behaviors should be covered by tests:
- authenticated join success
- unauthorized join or mutation rejection
- initial sync for a new connection
- incremental update propagation to peers in the same room
- no cross-room update leakage
- awareness join, update, and leave propagation
- disconnect cleanup
- empty-room cleanup
- persisted state restore behavior

## 12. Non-goals

- This repository is not the main REST API server
- This repository is not a generic chat WebSocket service
- This repository should not replace explicit sync logic with Hocuspocus or another black-box collaboration backend unless explicitly requested
