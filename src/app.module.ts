import { Module } from "@nestjs/common";

import { CollabAuthService } from "./auth/infrastructure/collab-auth.service";
import { ApplyDocumentUpdateUseCase } from "./collaboration/application/apply-document-update.use-case";
import { AuthenticateConnectionUseCase } from "./collaboration/application/authenticate-connection.use-case";
import { BroadcastAwarenessUseCase } from "./collaboration/application/broadcast-awareness.use-case";
import { DisconnectConnectionUseCase } from "./collaboration/application/disconnect-connection.use-case";
import { JoinRoomUseCase } from "./collaboration/application/join-room.use-case";
import { RoomRegistryService } from "./collaboration/domain/room-registry.service";
import { CollabPersistenceService } from "./collaboration/infrastructure/collab-persistence.service";
import { CollabGateway } from "./collaboration/presentation/collab.gateway";
import { SocketRegistryService } from "./collaboration/presentation/socket-registry.service";
import { HealthController } from "./health/health.controller";

@Module({
  controllers: [HealthController],
  providers: [
    CollabGateway,
    CollabAuthService,
    CollabPersistenceService,
    RoomRegistryService,
    SocketRegistryService,
    AuthenticateConnectionUseCase,
    JoinRoomUseCase,
    ApplyDocumentUpdateUseCase,
    BroadcastAwarenessUseCase,
    DisconnectConnectionUseCase
  ]
})
export class AppModule {}
