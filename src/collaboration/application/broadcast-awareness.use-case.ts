import { Injectable } from "@nestjs/common"

import type { RoomRegistryService } from "../domain/room-registry.service"
import type { AwarenessMessage } from "../presentation/collab-message.types"
import { CollabMessageType } from "../presentation/protocol.constants"
import type { Result } from "./application-result.types"

interface BroadcastAwarenessSuccess {
  message: AwarenessMessage
  peerConnectionIds: string[]
}

@Injectable()
export class BroadcastAwarenessUseCase {
  constructor(private readonly roomRegistryService: RoomRegistryService) {}

  execute(connectionId: string, encodedUpdate: string): Result<BroadcastAwarenessSuccess> {
    const connection = this.roomRegistryService.getConnection(connectionId)
    if (connection?.roomKey === null || connection?.roomKey === undefined) {
      return {
        ok: false,
        code: "ROOM_REQUIRED",
        message: "Join a room before sending awareness updates.",
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

    return {
      ok: true,
      message: {
        message: {
          type: CollabMessageType.Awareness,
          update: encodedUpdate,
        },
        peerConnectionIds: [...room.connectionIds].filter(
          (peerId) => peerId !== connection.connectionId
        ),
      },
    }
  }
}
