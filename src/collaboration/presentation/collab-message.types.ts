import type { CollabMessageType } from "./protocol.constants"

export interface AuthMessage {
  type: CollabMessageType.Auth
  token: string
}

export interface JoinMessage {
  type: CollabMessageType.Join
  workspaceId: string
  documentId: string
}

export interface SyncMessage {
  type: CollabMessageType.Sync
  update: string
}

export interface UpdateMessage {
  type: CollabMessageType.Update
  update: string
}

export interface AwarenessMessage {
  type: CollabMessageType.Awareness
  update: string
}

export interface LeaveMessage {
  type: CollabMessageType.Leave
}

export interface ErrorMessage {
  type: CollabMessageType.Error
  code: string
  message: string
}

export type ClientMessage =
  | AuthMessage
  | JoinMessage
  | SyncMessage
  | UpdateMessage
  | AwarenessMessage
  | LeaveMessage

export type ServerMessage = SyncMessage | UpdateMessage | AwarenessMessage | ErrorMessage
