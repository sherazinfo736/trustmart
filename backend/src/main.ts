import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DbService } from './db/db.service';
import { seed } from './db/seed';
import { ApiExceptionFilter } from './common/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });
  app.useGlobalFilters(new ApiExceptionFilter());

  // Prints every incoming request so it's visually obvious in the terminal
  // when the frontend is actually hitting this backend (vs. still on mock).
  app.use((req: any, _res: any, next: any) => {
    console.log(`→ ${req.method} ${req.originalUrl}`);
    next();
  });

  const db = app.get(DbService);
  seed(db);
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`TrustMart backend listening on http://localhost:${port}`);
}
bootstrap();
