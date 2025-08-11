import { Injectable } from "@nestjs/common";

import { AuthContext } from "../../collaboration/domain/room.types";

@Injectable()
export class CollabAuthService {
  async validateToken(token: string): Promise<AuthContext | null> {
    if (token.trim().length === 0) {
      return null;
    }

    return {
      userId: token,
      canWrite: true
    };
  }
}
