import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';
import { ReportStatus } from '@kalaa-connect/shared';

@ApiTags('Supervision & Santé')
@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  @ApiOperation({ summary: 'Vérification globale de l’état de santé de l’API, de la DB et des ressources' })
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
        totalUsers: this.db.users.size,
      },
      system: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
    };
  }

  @Get('health/live')
  @ApiOperation({ summary: 'Sonde de vivacité Kubernetes / Docker (Liveness Probe)' })
  @ApiResponse({ status: 200, description: 'Le processus est vivant et répond' })
  checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Sonde d’aptitude au trafic (Readiness Probe)' })
  @ApiResponse({ status: 200, description: 'Le service est prêt à recevoir des requêtes' })
  checkReadiness() {
    const isDbReady = this.db.reports !== undefined && this.db.users !== undefined;
    return {
      status: isDbReady ? 'ready' : 'unready',
      database: isDbReady ? 'operational' : 'degraded',
      mode: this.db.mode,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Contrôle spécifique de la connectivité et persistance de la base de données' })
  checkDatabase() {
    return {
      status: 'connected',
      mode: this.db.mode,
      reportsCount: this.db.reports.size,
      usersCount: this.db.users.size,
      servicesCount: this.db.services.size,
      categoriesCount: this.db.categories.size,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Export de métriques compatibles Prometheus / Grafana' })
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const totalReports = this.db.reports.size;
    const totalUsers = this.db.users.size;
    const memory = process.memoryUsage();

    // Comptage par statut
    const reportsList = Array.from(this.db.reports.values());
    const countNouveau = reportsList.filter((r) => r.statut === ReportStatus.NOUVEAU).length;
    const countAccepte = reportsList.filter((r) => r.statut === ReportStatus.ACCEPTE).length;
    const countEnCours = reportsList.filter((r) => r.statut === ReportStatus.EN_COURS).length;
    const countResolu = reportsList.filter((r) => r.statut === ReportStatus.RESOLU).length;
    const countCloture = reportsList.filter((r) => r.statut === ReportStatus.CLOTURE).length;
    const countRejete = reportsList.filter((r) => r.statut === ReportStatus.REJETE).length;

    return `
# HELP kalaa_api_uptime_seconds Durée de fonctionnement du service API en secondes
# TYPE kalaa_api_uptime_seconds gauge
kalaa_api_uptime_seconds ${uptime}

# HELP kalaa_reports_total Nombre total de signalements enregistrés dans Kalaa Connect
# TYPE kalaa_reports_total counter
kalaa_reports_total ${totalReports}

# HELP kalaa_reports_by_status Nombre de signalements par statut dans le cycle de vie municipal
# TYPE kalaa_reports_by_status gauge
kalaa_reports_by_status{status="nouveau"} ${countNouveau}
kalaa_reports_by_status{status="accepte"} ${countAccepte}
kalaa_reports_by_status{status="en_cours"} ${countEnCours}
kalaa_reports_by_status{status="resolu"} ${countResolu}
kalaa_reports_by_status{status="cloture"} ${countCloture}
kalaa_reports_by_status{status="rejete"} ${countRejete}

# HELP kalaa_users_total Nombre total d'utilisateurs enregistrés
# TYPE kalaa_users_total gauge
kalaa_users_total ${totalUsers}

# HELP kalaa_memory_heap_bytes Mémoire heap V8 utilisée
# TYPE kalaa_memory_heap_bytes gauge
kalaa_memory_heap_bytes ${memory.heapUsed}

# HELP kalaa_memory_rss_bytes Mémoire RSS totale allouée
# TYPE kalaa_memory_rss_bytes gauge
kalaa_memory_rss_bytes ${memory.rss}
`.trim();
  }
}
