import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Nesta primeira aula, a API atende apenas neste computador.
  await app.listen(3000, '127.0.0.1');
}
await bootstrap();
