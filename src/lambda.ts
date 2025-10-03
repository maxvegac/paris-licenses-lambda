import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import {
  Handler,
  Context,
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
> = async (event: APIGatewayProxyEvent, context: Context) => {
  const server = await createNestServer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return server(event, context);
};
