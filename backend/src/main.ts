import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const port = process.env.PORT || 4000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('jk-Tech Apis')
    .setDescription('API for JK-Teck')
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
  await app.listen(port);
}
bootstrap();
