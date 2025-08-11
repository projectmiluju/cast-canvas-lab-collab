import { Injectable } from "@nestjs/common";
import { applyUpdate, encodeStateAsUpdate } from "yjs";

import { RoomRegistryService } from "../domain/room-registry.service";
import { RoomRef } from "../domain/room.types";
import { CollabPersistenceService } from "../infrastructure/collab-persistence.service";
import { SyncMessage } from "../presentation/collab-message.types";
import { CollabMessageType } from "../presentation/protocol.constants";
import { Result } from "./application-result.types";

@Injectable()
export class JoinRoomUseCase {
  constructor(
    private readonly roomRegistryService: RoomRegistryService,
    private readonly persistenceService: CollabPersistenceService
  ) {}

  async execute(connectionId: string, ref: RoomRef): Promise<Result<SyncMessage>> {
    const connection = this.roomRegistryService.getConnection(connectionId);

    if (connection?.auth === null || connection?.auth === undefined) {
      return {
        ok: false,
        code: "AUTH_REQUIRED",
        message: "Authenticate before joining a room."
      };
    }

    const room = this.roomRegistryService.joinRoom(connectionId, ref);
    const persistedState = await this.persistenceService.loadDocumentState(room.key);

    if (persistedState !== null) {
      applyUpdate(room.doc, persistedState);
    }

    return {
      ok: true,
      message: {
        type: CollabMessageType.Sync,
        update: Buffer.from(encodeStateAsUpdate(room.doc)).toString("base64")
      }
    };
  }
}
