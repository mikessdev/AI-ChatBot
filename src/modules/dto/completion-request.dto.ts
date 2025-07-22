import {
  IsArray,
  IsDefined,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'USER', enum: ['USER', 'AGENT'] })
  @IsDefined()
  @IsString()
  role: 'USER' | 'AGENT';

  @ApiProperty({
    example:
      'Hello! How long does a Tesla battery last before it needs to be replaced?',
  })
  @IsDefined()
  @IsString()
  content: string;
}

export class CompletionRequestDto {
  @ApiProperty({ example: 123456 })
  @IsDefined()
  @IsNumber()
  helpdeskId: number;

  @ApiProperty({ example: 'tesla_motors' })
  @IsDefined()
  @IsString()
  projectName: string;

  @ApiProperty({
    type: [MessageDto],
    example: [
      {
        role: 'USER',
        content:
          'Hello! How long does a Tesla battery last before it needs to be replaced?',
      },
    ],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}
