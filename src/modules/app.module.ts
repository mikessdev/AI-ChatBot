import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationsModule } from './conversations.module';
import { OpenaiApiModule } from './openai-api.module';
import { ClaudIaModule } from './claud-ia.module';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ConversationsModule,
    OpenaiApiModule,
    ClaudIaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
