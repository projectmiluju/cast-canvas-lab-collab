import "reflect-metadata"

import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { WsAdapter } from "@nestjs/platform-ws"

import { AppModule } from "./app.module"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const port = Number.parseInt(process.env.PORT ?? "3001", 10)

  app.useWebSocketAdapter(new WsAdapter(app))

  await app.listen(port)

  Logger.log(`Collab server listening on port ${port}`, "Bootstrap")
}

void bootstrap()
