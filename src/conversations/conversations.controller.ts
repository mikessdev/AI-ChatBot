import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CompletionRequestDto } from './dto/completion-request.dto';
import { ConversationsService } from './conversations.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompletionResponse } from 'src/swagger/conversations.api.response';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('completions')
  @ApiResponse({
    status: HttpStatus.OK,
    type: CompletionResponse,
  })
  generateCompletion(@Body() body: CompletionRequestDto) {
    return this.conversationsService.generateCompletion(body);
  }
}
