import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import {
  Handler,
  Context,
  Callback,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import express from 'express';
import serverless from 'serverless-http';

let cachedServer: serverless.Handler | undefined;

async function createNestServer(): Promise<serverless.Handler> {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);

    // Enable CORS if needed
    app.enableCors();

    await app.init();
    cachedServer = serverless(expressApp);
  }
  return cachedServer;
}

export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  const server = await createNestServer();
  return server(
    event as Parameters<serverless.Handler>[0],
    context as Parameters<serverless.Handler>[1],
    callback as Parameters<serverless.Handler>[2],
  );
};
