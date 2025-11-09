import { Injectable } from '@nestjs/common';

@Injectable()
export class CollabPersistenceService {
  async loadDocumentState(roomKey: string): Promise<Uint8Array | null> {
    void roomKey;
    return null;
  }

  async saveDocumentState(roomKey: string, state: Uint8Array): Promise<void> {
    void roomKey;
    void state;
    return;
  }
}
