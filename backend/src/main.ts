import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

const port = process.env.PORT || 4000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('jk-Tech Apis')
    .setDescription('API for JK-Tech')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('/api/docs', app, documentFactory, {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
  });

  SwaggerModule.setup('api', app, documentFactory);

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at:`, promise, reason);
  });

  await app.listen(port);
}
bootstrap();
