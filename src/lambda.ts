import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
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
  APIGatewayProxyEvent | any,
  APIGatewayProxyResult
> = async (event: APIGatewayProxyEvent | any, context: Context) => {
  // Check if this is an EventBridge invocation
  if (event.source === 'aws.events' && event['detail-type'] === 'Scheduled Event') {
    console.log('🔄 EventBridge triggered sync - processing orders...');
    
    try {
      // Create NestJS app directly for EventBridge calls
      const expressApp = express();
      const adapter = new ExpressAdapter(expressApp);
      const app = await NestFactory.create(AppModule, adapter);
      await app.init();
      
      const appController = app.get(AppController);
      const result = await appController.syncOrders();
      
      console.log(`✅ Sync completed: ${result.newOrders.length} new orders, ${result.stats.totalProcessed} total processed`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Sync completed successfully',
          newOrders: result.newOrders.length,
          totalProcessed: result.stats.totalProcessed,
          totalFailed: result.stats.totalFailed,
        }),
      };
    } catch (error) {
      console.error('❌ Error during EventBridge sync:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Sync failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  }
  
  // Regular API Gateway request
  const server = await createNestServer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return server(event, context);
};
