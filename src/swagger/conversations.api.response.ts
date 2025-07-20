import { ApiProperty } from '@nestjs/swagger';
import { MessageDto } from 'src/modules/dto/completion-request.dto';
import { SectionRetrievedDto } from 'src/modules/dto/completion-response.dto';

export class CompletionResponse {
  @ApiProperty({
    type: [MessageDto],
    example: [
      {
        role: 'USER',
        content:
          'Hello! How long does a Tesla battery last before it needs to be replaced?',
      },
      {
        role: 'AGENT',
        content:
          "Hello! How can I assist you today? I'm Claudia, your Tesla support assistant 😊\nTesla batteries are designed to last many years; the vehicle will notify you if maintenance is needed! Let me know if you have more questions! 🚗⚡",
      },
    ],
  })
  readonly messages: MessageDto[];

  @ApiProperty({ example: false })
  readonly handoverToHumanNeeded: boolean;

  @ApiProperty({
    type: [SectionRetrievedDto],
    example: [
      {
        score: 0.6085123,
        content:
          'How do I know if my Tesla battery needs replacement? Tesla batteries are designed to last many years; the vehicle will notify you if maintenance is needed.',
      },
      {
        score: 0.5785547,
        content:
          "What is Tesla's battery warranty? Tesla’s battery warranty typically lasts for 8 years or about 150,000 miles, depending on the model.",
      },
    ],
  })
  readonly sectionsRetrieved: SectionRetrievedDto[];
}
