import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationsModule } from './conversations/conversations.module';
import { OpenaiApiModule } from './openai-api/openai-api.module';
import { ConfigModule } from '@nestjs/config';
import { ClaudIaModule } from './claud-ia/claud-ia.module';

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
