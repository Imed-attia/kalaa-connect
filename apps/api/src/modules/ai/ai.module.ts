import { Module } from '@nestjs/common';
import { AiClassificationService } from './ai.service';
import { AiController } from './ai.controller';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  controllers: [AiController],
  providers: [AiClassificationService, AuthGuard],
  exports: [AiClassificationService],
})
export class AiModule {}
