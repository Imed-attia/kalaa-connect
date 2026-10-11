import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, AuthGuard],
  exports: [UploadsService],
})
export class UploadsModule {}
