import { Module } from '@nestjs/common';
import { CloudIAService } from './service/claud-ia.service';
import { CloudIARepository } from './repository/claud-ia.repository';

@Module({
  controllers: [],
  providers: [CloudIAService, CloudIARepository],
  exports: [CloudIAService],
  imports: [],
})
export class ClaudIaModule {}
