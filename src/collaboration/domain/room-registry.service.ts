import { Injectable } from "@nestjs/common"
import { Awareness } from "y-protocols/awareness"
import * as Y from "yjs"

import type { AuthContext, RoomConnection, RoomRef, RoomState } from "./room.types"

@Injectable()
export class RoomRegistryService {
  private readonly connections = new Map<string, RoomConnection>()
  private readonly rooms = new Map<string, RoomState>()

  registerConnection(connectionId: string): RoomConnection {
    const connection: RoomConnection = {
      connectionId,
      auth: null,
      roomKey: null,
    }

    this.connections.set(connectionId, connection)

    return connection
  }

  setAuth(connectionId: string, auth: AuthContext): RoomConnection {
    const connection = this.mustGetConnection(connectionId)
    connection.auth = auth
    return connection
  }

  joinRoom(connectionId: string, ref: RoomRef): RoomState {
    const connection = this.mustGetConnection(connectionId)
    const nextRoomKey = this.buildRoomKey(ref)

    if (connection.roomKey !== null && connection.roomKey !== nextRoomKey) {
      this.leaveCurrentRoom(connectionId)
    }

    const room = this.getOrCreateRoom(ref)
    room.connectionIds.add(connectionId)
    connection.roomKey = room.key

    return room
  }

  leaveCurrentRoom(connectionId: string): void {
    const connection = this.mustGetConnection(connectionId)

    if (connection.roomKey === null) {
      return
    }

    const room = this.rooms.get(connection.roomKey)
    if (room !== undefined) {
      room.connectionIds.delete(connectionId)
      if (room.connectionIds.size === 0) {
        room.awareness.destroy()
        room.doc.destroy()
        this.rooms.delete(room.key)
      }
    }

    connection.roomKey = null
  }

  removeConnection(connectionId: string): void {
    if (!this.connections.has(connectionId)) {
      return
    }

    this.leaveCurrentRoom(connectionId)
    this.connections.delete(connectionId)
  }

  getRoomByKey(roomKey: string): RoomState | undefined {
    return this.rooms.get(roomKey)
  }

  getConnection(connectionId: string): RoomConnection | undefined {
    return this.connections.get(connectionId)
  }

  buildRoomKey(ref: RoomRef): string {
    return `${ref.workspaceId}:${ref.documentId}`
  }

  private getOrCreateRoom(ref: RoomRef): RoomState {
    const key = this.buildRoomKey(ref)
    const existing = this.rooms.get(key)

    if (existing !== undefined) {
      return existing
    }

    const doc = new Y.Doc()
    const room: RoomState = {
      key,
      workspaceId: ref.workspaceId,
      documentId: ref.documentId,
      doc,
      awareness: new Awareness(doc),
      connectionIds: new Set(),
    }

    this.rooms.set(key, room)

    return room
  }

  private mustGetConnection(connectionId: string): RoomConnection {
    const connection = this.connections.get(connectionId)

    if (connection === undefined) {
      throw new Error(`Unknown connection: ${connectionId}`)
    }

    return connection
  }
}
