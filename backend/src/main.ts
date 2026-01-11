import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './infrastructure/exceptions/app-error.exception';
import Database from './infrastructure/database/database';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Database Singleton
  await Database.getInstance();

  // Enable cookie parser
  app.use(cookieParser());

  // Global exception filter (Infrastructure layer)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS if needed
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
