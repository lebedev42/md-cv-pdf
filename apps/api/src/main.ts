import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['X-Filename'],
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
