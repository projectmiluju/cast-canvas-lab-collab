import { CollabAuthService } from "../src/auth/infrastructure/collab-auth.service"

describe("CollabAuthService", () => {
  let service: CollabAuthService

  beforeEach(() => {
    service = new CollabAuthService()
  })

  it("rejects an empty token", async () => {
    await expect(service.validateToken("")).resolves.toBeNull()
  })

  it("accepts a non-empty token in the placeholder implementation", async () => {
    await expect(service.validateToken("user-1")).resolves.toEqual({
      userId: "user-1",
      canWrite: true,
    })
  })
})
