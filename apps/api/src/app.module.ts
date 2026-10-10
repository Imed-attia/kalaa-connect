import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AiModule } from './modules/ai/ai.module';
import { OpenDataModule } from './modules/opendata/opendata.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ReportsModule,
    UploadsModule,
    NotificationsModule,
    AiModule,
    OpenDataModule,
    HealthModule,
  ],
})
export class AppModule {}
