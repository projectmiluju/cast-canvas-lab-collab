import { Injectable } from "@nestjs/common"
import { encodeStateAsUpdate } from "yjs"

import type { RoomRegistryService } from "../domain/room-registry.service"
import type { CollabPersistenceService } from "../infrastructure/collab-persistence.service"

@Injectable()
export class DisconnectConnectionUseCase {
  constructor(
    private readonly roomRegistryService: RoomRegistryService,
    private readonly persistenceService: CollabPersistenceService
  ) {}

  async execute(connectionId: string): Promise<void> {
    const connection = this.roomRegistryService.getConnection(connectionId)

    if (connection?.roomKey !== null && connection?.roomKey !== undefined) {
      const room = this.roomRegistryService.getRoomByKey(connection.roomKey)
      if (room !== undefined) {
        await this.persistenceService.saveDocumentState(room.key, encodeStateAsUpdate(room.doc))
      }
    }

    this.roomRegistryService.removeConnection(connectionId)
  }

  async leaveRoom(connectionId: string): Promise<void> {
    this.roomRegistryService.leaveCurrentRoom(connectionId)
  }
}
