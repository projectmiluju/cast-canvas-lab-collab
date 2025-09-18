import { Injectable } from "@nestjs/common"

import type { CollabAuthService } from "../../auth/infrastructure/collab-auth.service"
import type { AuthContext } from "../domain/room.types"
import type { RoomRegistryService } from "../domain/room-registry.service"

@Injectable()
export class AuthenticateConnectionUseCase {
  constructor(
    private readonly authService: CollabAuthService,
    private readonly roomRegistryService: RoomRegistryService
  ) {}

  async execute(connectionId: string, token: string): Promise<AuthContext | null> {
    const auth = await this.authService.validateToken(token)

    if (auth === null) {
      return null
    }

    this.roomRegistryService.setAuth(connectionId, auth)
    return auth
  }
}
