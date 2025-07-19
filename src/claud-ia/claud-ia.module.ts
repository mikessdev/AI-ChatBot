import { Module } from '@nestjs/common';
import { CloudIAService } from './claud-ia.service';
import { CloudIARepository } from './claud-ia.repository';

@Module({
  controllers: [],
  providers: [CloudIAService, CloudIARepository],
  exports: [CloudIAService],
  imports: [],
})
export class ClaudIaModule {}
