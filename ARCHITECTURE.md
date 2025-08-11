# CastCanvas Lab — Architecture Overview

## 1. Project summary

CastCanvas Lab is a spatial research workspace where users can drop documents and reference images onto an infinite canvas, organize them visually, and connect ideas in one place.

The product is designed to be:

- more spatial than Notion
- more document-friendly than Figma
- extensible toward real-time collaborative editing

---

## 2. Repository map

### `cast-canvas-lab-fe`

Frontend application for the workspace UI.

Owns:

- infinite canvas UI
- document/image interaction
- node and edge rendering
- inspector/panel UI
- search UI
- upload UI
- Yjs client integration
- collaboration client behavior in the browser

Does not own:

- business metadata persistence
- signed upload URL generation
- search indexing
- Yjs backend sync protocol
- workspace authorization source of truth

### `cast-canvas-lab-be`

Main application backend.

Owns:

- authentication and authorization
- users and workspaces
- canvas metadata
- node/edge metadata
- asset/document metadata
- signed upload URL issuance
- search API
- async job orchestration
- integration contract for collab auth/access

Does not own:

- direct collaborative CRDT sync
- awareness/presence broadcasting
- collaborative WebSocket transport

### `cast-canvas-lab-collab`

Real-time collaboration backend.

Owns:

- Yjs-compatible WebSocket synchronization
- room/document session lifecycle
- initial sync
- incremental update fan-out
- awareness/presence propagation
- collaboration-state persistence strategy
- real-time connection auth validation through backend integration

Does not own:

- general REST business APIs
- workspace metadata CRUD
- upload URL generation
- search endpoints

### `cast-canvas-lab-site`

Public-facing website.

Owns:

- landing page
- feature pages
- product communication
- screenshots/demo presentation
- public docs or release content
- links into the app

Does not own:

- workspace app logic
- metadata APIs
- collaboration transport
- authenticated canvas behavior

---

## 3. High-level system structure

```text
[ cast-canvas-lab-site ]
          |
          v
[ public users ] ---> [ cast-canvas-lab-fe ]
                           |          \
                           |           \
                           v            v
                 [ cast-canvas-lab-be ] [ cast-canvas-lab-collab ]
                           |
                           v
                    [ PostgreSQL / Redis / S3 ]
```

### Main idea

- `site` explains the product
- `fe` is the actual workspace app
- `be` is the source of truth for auth, metadata, uploads, jobs, and search
- `collab` handles shared real-time canvas state

---

## 4. Core architectural principles

### 4.1 Clear ownership boundaries

Each repository should have a narrow, explicit responsibility.
Do not duplicate business ownership across repositories.

### 4.2 Canvas-first product design

The product is centered around a spatial canvas workflow.
Document reading may happen in a side panel, but research organization remains spatial.

### 4.3 Metadata and sync are separate concerns

Relational metadata and collaborative shared state are different.

- metadata belongs to `be`
- collaborative sync belongs to `collab`

### 4.4 Future collaboration compatibility

Even when implementing local-first or MVP behavior, data structures should remain compatible with future shared editing and synchronization.

### 4.5 Honest product communication

`site` must describe actual current capabilities.
Planned features should be clearly labeled as planned.

---

## 5. Main data ownership

### Backend-owned metadata

Owned by `cast-canvas-lab-be`:

- user
- workspace
- canvas
- node metadata
- edge metadata
- asset metadata
- document metadata
- upload job metadata
- search metadata
- access rights

### Collaboration-owned shared state

Owned by `cast-canvas-lab-collab`:

- collaborative room session state
- shared Yjs document state
- awareness state
- real-time connection state
- sync update distribution

### Frontend-owned local UI state

Owned by `cast-canvas-lab-fe`:

- selected node
- panel open/close state
- viewport state
- temporary drag state
- local UI preferences

---

## 6. Main integration flows

### 6.1 Authentication flow

1. user signs in through `fe`
2. `fe` calls `be`
3. `be` validates credentials and issues auth token
4. `fe` uses this token for backend API calls
5. `fe` also uses an auth token or validated session info when connecting to `collab`

### 6.2 Upload flow

1. user drops a document/image in `fe`
2. `fe` requests a signed upload URL from `be`
3. `be` validates access and returns signed upload data
4. `fe` uploads the file directly to object storage
5. `fe` informs `be` that upload completed
6. `be` stores asset/document metadata and may enqueue async jobs

### 6.3 Document processing flow

1. document metadata is stored in `be`
2. `be` creates parsing/indexing jobs
3. worker processes the document
4. results are stored back through backend-owned persistence
5. `fe` later reads processed structure/search results from `be`

### 6.4 Real-time collaboration flow

1. user opens a workspace in `fe`
2. `fe` connects to `collab`
3. `collab` validates access directly or via `be`
4. `collab` joins the user to a room/document session
5. Yjs sync occurs:
   - initial sync
   - incremental updates
   - awareness updates
6. all connected clients see collaborative updates in near real time

---

## 7. API and protocol boundaries

### FE ↔ BE

Use for:

- auth
- workspace CRUD
- canvas metadata
- asset/document metadata
- upload flows
- search
- job status

### FE ↔ COLLAB

Use for:

- shared real-time canvas state
- collaborative updates
- awareness/presence
- room join/leave lifecycle

### BE ↔ COLLAB

Use for:

- auth/access validation
- workspace/document permission checks
- optional metadata lookup needed for collaboration access

Important rule:

- do not move core business APIs into `collab`
- do not move CRDT sync responsibilities into `be`

---

## 8. Collaboration model

The collaboration server is intentionally implemented directly rather than delegated to a prebuilt collaboration backend.

That means `cast-canvas-lab-collab` should explicitly support:

- room lifecycle
- Yjs document lifecycle
- state-vector-based initial sync
- update fan-out
- awareness sync
- disconnect cleanup
- persistence-ready design

This is a core technical differentiator of the project.

---

## 9. Persistence model

### Relational persistence

Primary relational metadata is stored through `be`.

Expected persistence includes:

- workspaces
- nodes/edges metadata
- assets/documents metadata
- permissions
- job records
- search-related records

### Collaboration persistence

Shared collaboration state is handled by `collab`.
This should be treated as sync-oriented document state, not naive plain JSON-first data.

### Object storage

Raw uploaded assets are stored in S3-compatible object storage.

---

## 10. Search model

Search is backend-owned.

Expected search responsibilities:

- index document-derived text/content
- expose search endpoints to `fe`
- support jumping from search results to source document/section
- keep search separate from collaboration transport

---

## 11. Environment and deployment direction

### Public domain direction

- `castcanvaslab.com` → public site
- `app.castcanvaslab.com` → main workspace app

### App services

- `fe`: deployed as frontend app
- `be`: deployed as main API server
- `collab`: deployed as dedicated WebSocket collaboration server
- object storage, DB, Redis handled separately

---

## 12. Non-goals

These are not the main goals of the current architecture:

- turning the app into a Notion-style linear document editor
- turning the app into a Figma clone for design production
- collapsing all repos into one runtime responsibility
- placing collaboration sync inside the ordinary backend API
- making the public site responsible for app behavior

---

## 13. Naming and terminology

Use these terms consistently:

- workspace
- canvas
- node
- edge
- document
- reference image
- asset
- collaboration
- awareness
- sync
- metadata

Avoid inventing alternate terms unless necessary.

---

## 14. Guidance for repository agents

When working inside any repository:

1. respect repository boundaries
2. do not move another repo’s responsibility into the current one
3. preserve the distinction between metadata and collaborative sync
4. prefer explicit integration contracts
5. align naming with the shared system terminology
6. check whether a change affects FE, BE, COLLAB, or SITE ownership before implementing it
