import { RoomRegistryService } from "../src/collaboration/domain/room-registry.service";

describe("RoomsService", () => {
  let service: RoomRegistryService;

  beforeEach(() => {
    service = new RoomRegistryService();
  });

  it("creates a room with a stable key", () => {
    service.registerConnection("conn-1");

    const room = service.joinRoom("conn-1", {
      workspaceId: "ws-1",
      documentId: "doc-1"
    });

    expect(room.key).toBe("ws-1:doc-1");
    expect(room.connectionIds.has("conn-1")).toBe(true);
  });

  it("cleans up an empty room when the last connection leaves", () => {
    service.registerConnection("conn-1");
    const room = service.joinRoom("conn-1", {
      workspaceId: "ws-1",
      documentId: "doc-1"
    });

    service.removeConnection("conn-1");

    expect(service.getRoomByKey(room.key)).toBeUndefined();
  });
});
