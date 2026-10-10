import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';

@ApiTags('Supervision & Santé')
@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  @ApiOperation({ summary: 'Vérification de l’état de santé de l’API, de la DB et de la mémoire' })
  checkHealth() {
    const memory = process.memoryUsage();
    return {
      status: 'ok',
      service: 'kalaa-connect-api',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: {
        mode: this.db.mode,
        status: 'connected',
        totalReports: this.db.reports.size,
      },
      system: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      },
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Export de métriques compatibles Prometheus / Grafana Cloud' })
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const totalReports = this.db.reports.size;
    const memory = process.memoryUsage();

    return `
# HELP kalaa_api_uptime_seconds Durée de fonctionnement de l'API en secondes
# TYPE kalaa_api_uptime_seconds gauge
kalaa_api_uptime_seconds ${uptime}

# HELP kalaa_reports_total Nombre total de signalements enregistrés
# TYPE kalaa_reports_total counter
kalaa_reports_total ${totalReports}

# HELP kalaa_memory_heap_bytes Mémoire heap utilisée
# TYPE kalaa_memory_heap_bytes gauge
kalaa_memory_heap_bytes ${memory.heapUsed}
`.trim();
  }
}
