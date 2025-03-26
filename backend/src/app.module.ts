import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { UserModule } from './user/user.module';
import { JwtAuthGuard } from './utils/guards/auth.guard';
import { RoleModule } from './role/role.module';
import config from './utils/config';
import { APP_GUARD } from '@nestjs/core';
import { CaslModule } from './casl/casl.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    AuthModule,
    DocumentModule,
    IngestionModule,
    UserModule,
    RoleModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
