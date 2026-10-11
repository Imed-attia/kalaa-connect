import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  CreateReportDto,
  UpdateReportStatusDto,
  UpdateReportDetailsDto,
  AddCommentDto,
  FilterReportsDto,
} from './reports.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, DEFAULT_MUNICIPAL_SERVICES, DEFAULT_CATEGORIES } from '@kalaa-connect/shared';

@ApiTags('Signalements Urbains')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('services')
  @ApiOperation({ summary: 'Liste des services municipaux techniques de Kalâa Seghira' })
  getServices() {
    return DEFAULT_MUNICIPAL_SERVICES;
  }

  @Get('categories')
  @ApiOperation({ summary: 'Liste des catégories d’anomalies bilingues' })
  getCategories() {
    return DEFAULT_CATEGORIES;
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Création d’un nouveau signalement d’anomalie urbaine' })
  @ApiResponse({ status: 201, description: 'Signalement enregistré avec succès' })
  async createReport(
    @Body() dto: CreateReportDto,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.createReport(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Recherche et liste des signalements avec filtres et pagination' })
  async findAll(@Query() filters: FilterReportsDto) {
    return this.reportsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails complets d’un signalement, historique et commentaires' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mise à jour du statut d’un ticket selon la machine à états' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.updateStatus(id, dto, user);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajout d’un commentaire ou suivi sur un signalement' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.addComment(id, dto, user);
  }

  @Patch(':id')
  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modification des détails d’un signalement (titre, description, etc.)' })
  async updateReport(
    @Param('id') id: string,
    @Body() dto: UpdateReportDetailsDto,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.updateReport(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suppression d’un signalement' })
  async deleteReport(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.deleteReport(id, user);
  }
}
