import { Injectable } from "@nestjs/common";

@Injectable()
export class CollabPersistenceService {
  async loadDocumentState(_roomKey: string): Promise<Uint8Array | null> {
    return null;
  }

  async saveDocumentState(_roomKey: string, _state: Uint8Array): Promise<void> {
    return;
  }
}
