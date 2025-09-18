import { Injectable } from "@nestjs/common"
import { applyUpdate } from "yjs"

import type { RoomRegistryService } from "../domain/room-registry.service"
import type { UpdateMessage } from "../presentation/collab-message.types"
import { CollabMessageType } from "../presentation/protocol.constants"
import type { Result } from "./application-result.types"

interface ApplyDocumentUpdateSuccess {
  message: UpdateMessage
  peerConnectionIds: string[]
}

@Injectable()
export class ApplyDocumentUpdateUseCase {
  constructor(private readonly roomRegistryService: RoomRegistryService) {}

  execute(connectionId: string, encodedUpdate: string): Result<ApplyDocumentUpdateSuccess> {
    const connection = this.roomRegistryService.getConnection(connectionId)
    if (connection?.roomKey === null || connection?.roomKey === undefined) {
      return {
        ok: false,
        code: "ROOM_REQUIRED",
        message: "Join a room before sending document updates.",
      }
    }

    if (connection.auth?.canWrite !== true) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "This connection is not allowed to mutate the document.",
      }
    }

    const room = this.roomRegistryService.getRoomByKey(connection.roomKey)
    if (room === undefined) {
      return {
        ok: false,
        code: "ROOM_NOT_FOUND",
        message: "The current room is unavailable.",
      }
    }

    applyUpdate(room.doc, Buffer.from(encodedUpdate, "base64"))

    return {
      ok: true,
      message: {
        message: {
          type: CollabMessageType.Update,
          update: encodedUpdate,
        },
        peerConnectionIds: [...room.connectionIds].filter(
          (peerId) => peerId !== connection.connectionId
        ),
      },
    }
  }
}
