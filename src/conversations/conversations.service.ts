import { Injectable } from '@nestjs/common';
import { CompletionRequestDto } from './dto/completion-request.dto';

@Injectable()
export class ConversationsService {
  generateCompletion(completion: CompletionRequestDto) {
    return 'Hello World';
  }
}
