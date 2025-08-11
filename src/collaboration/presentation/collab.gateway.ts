import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway
} from "@nestjs/websockets";
import { RawData, WebSocket } from "ws";

import { ApplyDocumentUpdateUseCase } from "../application/apply-document-update.use-case";
import { AuthenticateConnectionUseCase } from "../application/authenticate-connection.use-case";
import { BroadcastAwarenessUseCase } from "../application/broadcast-awareness.use-case";
import { DisconnectConnectionUseCase } from "../application/disconnect-connection.use-case";
import { JoinRoomUseCase } from "../application/join-room.use-case";
import {
  ClientMessage,
  ErrorMessage,
  ServerMessage
} from "./collab-message.types";
import { CollabMessageType, COLLAB_WS_PATH } from "./protocol.constants";
import { SocketRegistryService } from "./socket-registry.service";

@WebSocketGateway({
  path: COLLAB_WS_PATH
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CollabGateway.name);

  constructor(
    private readonly authenticateConnectionUseCase: AuthenticateConnectionUseCase,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly applyDocumentUpdateUseCase: ApplyDocumentUpdateUseCase,
    private readonly broadcastAwarenessUseCase: BroadcastAwarenessUseCase,
    private readonly disconnectConnectionUseCase: DisconnectConnectionUseCase,
    private readonly socketRegistryService: SocketRegistryService
  ) {}

  handleConnection(client: WebSocket): void {
    const connectionId = crypto.randomUUID();
    this.socketRegistryService.register(connectionId, client);

    client.on("message", (raw: RawData) => {
      void this.handleRawMessage(client, raw);
    });
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    const connectionId = this.getConnectionId(client);

    await this.disconnectConnectionUseCase.execute(connectionId);
    this.socketRegistryService.unregister(connectionId);
  }

  private async handleRawMessage(client: WebSocket, raw: RawData): Promise<void> {
    const message = this.parseMessage(raw);
    if (message === null) {
      this.send(client, {
        type: CollabMessageType.Error,
        code: "INVALID_MESSAGE",
        message: "Expected a valid JSON message payload."
      });
      return;
    }

    switch (message.type) {
      case CollabMessageType.Auth:
        await this.handleAuth(client, message.token);
        return;
      case CollabMessageType.Join:
        await this.handleJoin(client, message.workspaceId, message.documentId);
        return;
      case CollabMessageType.Update:
      case CollabMessageType.Sync:
        this.handleDocumentUpdate(client, message.update);
        return;
      case CollabMessageType.Awareness:
        this.handleAwareness(client, message.update);
        return;
      case CollabMessageType.Leave:
        await this.disconnectConnectionUseCase.leaveRoom(this.getConnectionId(client));
        return;
    }
  }

  private async handleAuth(client: WebSocket, token: string): Promise<void> {
    const auth = await this.authenticateConnectionUseCase.execute(
      this.getConnectionId(client),
      token
    );

    if (auth !== null) {
      return;
    }

    this.send(client, {
      type: CollabMessageType.Error,
      code: "UNAUTHORIZED",
      message: "Authentication failed."
    });
  }

  private async handleJoin(
    client: WebSocket,
    workspaceId: string,
    documentId: string
  ): Promise<void> {
    const result = await this.joinRoomUseCase.execute(this.getConnectionId(client), {
      workspaceId,
      documentId
    });

    if (!result.ok) {
      this.send(client, {
        type: CollabMessageType.Error,
        code: result.code,
        message: result.message
      });
      return;
    }

    this.send(client, result.message);
  }

  private handleDocumentUpdate(client: WebSocket, encodedUpdate: string): void {
    const result = this.applyDocumentUpdateUseCase.execute(
      this.getConnectionId(client),
      encodedUpdate
    );

    if (!result.ok) {
      this.send(client, {
        type: CollabMessageType.Error,
        code: result.code,
        message: result.message
      });
      return;
    }

    for (const peerId of result.message.peerConnectionIds) {
      const peer = this.findClientByConnectionId(peerId);
      if (peer === null) {
        continue;
      }

      this.send(peer, result.message.message);
    }
  }

  private handleAwareness(client: WebSocket, encodedUpdate: string): void {
    const result = this.broadcastAwarenessUseCase.execute(
      this.getConnectionId(client),
      encodedUpdate
    );

    if (!result.ok) {
      this.send(client, {
        type: CollabMessageType.Error,
        code: result.code,
        message: result.message
      });
      return;
    }

    for (const peerId of result.message.peerConnectionIds) {
      const peer = this.findClientByConnectionId(peerId);
      if (peer === null) {
        continue;
      }

      this.send(peer, result.message.message);
    }
  }

  private parseMessage(raw: RawData): ClientMessage | null {
    const payload = raw instanceof Buffer ? raw.toString("utf8") : raw.toString();

    try {
      return JSON.parse(payload) as ClientMessage;
    } catch (error) {
      this.logger.warn(`Failed to parse client message: ${String(error)}`);
      return null;
    }
  }

  private send(client: WebSocket, message: ServerMessage | ErrorMessage): void {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    client.send(JSON.stringify(message));
  }

  private getConnectionId(client: WebSocket): string {
    return this.socketRegistryService.mustGetConnectionId(client);
  }

  private findClientByConnectionId(connectionId: string): WebSocket | null {
    return this.socketRegistryService.get(connectionId);
  }
}
