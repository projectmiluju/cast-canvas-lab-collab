import { Injectable } from "@nestjs/common"
import type { WebSocket } from "ws"

import type { RoomRegistryService } from "../domain/room-registry.service"

@Injectable()
export class SocketRegistryService {
  private readonly clients = new Map<string, WebSocket>()

  constructor(private readonly roomRegistryService: RoomRegistryService) {}

  register(connectionId: string, client: WebSocket): void {
    Reflect.set(client, "__connectionId", connectionId)
    this.clients.set(connectionId, client)
    this.roomRegistryService.registerConnection(connectionId)
  }

  unregister(connectionId: string): void {
    this.clients.delete(connectionId)
  }

  get(connectionId: string): WebSocket | null {
    return this.clients.get(connectionId) ?? null
  }

  mustGetConnectionId(client: WebSocket): string {
    const connectionId = Reflect.get(client, "__connectionId")

    if (typeof connectionId !== "string") {
      throw new Error("Client is missing connection metadata.")
    }

    return connectionId
  }
}
