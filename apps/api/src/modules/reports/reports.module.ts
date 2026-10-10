import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, AuthGuard, RolesGuard],
  exports: [ReportsService],
})
export class ReportsModule {}
