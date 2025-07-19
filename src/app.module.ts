import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [ConversationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
