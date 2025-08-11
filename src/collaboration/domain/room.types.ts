import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export interface AuthContext {
  userId: string;
  canWrite: boolean;
}

export interface RoomRef {
  workspaceId: string;
  documentId: string;
}

export interface RoomConnection {
  connectionId: string;
  auth: AuthContext | null;
  roomKey: string | null;
}

export interface RoomState extends RoomRef {
  key: string;
  doc: Y.Doc;
  awareness: Awareness;
  connectionIds: Set<string>;
}
