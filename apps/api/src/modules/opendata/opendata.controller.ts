import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { OpenDataService } from './opendata.service';

@ApiTags('Open Data & Statistiques Publiques')
@Controller()
export class OpenDataController {
  constructor(private readonly openDataService: OpenDataService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Indicateurs clés et statistiques d’impact municipal (Open Data)' })
  @ApiResponse({ status: 200, description: 'Statistiques agrégées sans données personnelles' })
  getStats() {
    return this.openDataService.getStats();
  }

  @Get('open-data')
  @ApiOperation({ summary: 'Résumé Open Data public' })
  getOpenData() {
    return this.openDataService.getStats();
  }

  @Get('open-data/export.csv')
  @ApiOperation({ summary: 'Export officiel au format CSV des signalements urbains' })
  exportCsv(@Res() res: Response) {
    const csvData = this.openDataService.generateCsvExport();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kalaa-connect-incidents.csv"');
    return res.send(csvData);
  }
}
