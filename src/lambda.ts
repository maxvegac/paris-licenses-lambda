import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Handler, Context, Callback } from 'aws-lambda';
import express from 'express';
import serverless from 'serverless-http';

let cachedServer: any;

async function createNestServer(): Promise<any> {
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

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  const server = await createNestServer();
  return server(event, context, callback);
};
