import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:9000',
      'http://localhost:9001',
      'http://localhost:8080',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(e => ({
        field: e.property,
        errors: Object.values(e.constraints || {}),
      }));
      return new BadRequestException({ message: 'Campos inválidos o vacíos', errors: messages });
    },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend UNO-A corriendo en http://localhost:${port}`);
}

bootstrap();
