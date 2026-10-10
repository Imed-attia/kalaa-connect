import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ReportStatus, ReportPriority } from '@kalaa-connect/shared';

export class CreateReportDto {
  @ApiProperty({ example: 'Nid-de-poule dangereux rue Ibn Khaldoun' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  titre: string;

  @ApiProperty({ example: 'Trou important au milieu de la chaussée risquant d’endommager les véhicules.' })
  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  description: string;

  @ApiProperty({ example: 'cat-nid-de-poule' })
  @IsString()
  @IsNotEmpty({ message: 'La catégorie est obligatoire' })
  categorie_id: string;

  @ApiProperty({ example: 35.8285, description: 'Latitude GPS (Kalâa Seghira)' })
  @IsNumber()
  @Min(35.7, { message: 'Latitude hors limites de Kalâa Seghira' })
  @Max(35.95, { message: 'Latitude hors limites de Kalâa Seghira' })
  latitude: number;

  @ApiProperty({ example: 10.564, description: 'Longitude GPS (Kalâa Seghira)' })
  @IsNumber()
  @Min(10.45, { message: 'Longitude hors limites de Kalâa Seghira' })
  @Max(10.65, { message: 'Longitude hors limites de Kalâa Seghira' })
  longitude: number;

  @ApiPropertyOptional({ example: 'Avenue Habib Bourguiba' })
  @IsString()
  @IsOptional()
  adresse_approximative?: string;

  @ApiPropertyOptional({ example: 'Centre-Ville' })
  @IsString()
  @IsOptional()
  quartier?: string;

  @ApiProperty({ example: 'https://storage.kalaa.tn/photo-123.jpg' })
  @IsString()
  @IsNotEmpty({ message: 'Une photo de signalement est obligatoire' })
  photo_url: string;

  @ApiPropertyOptional({ enum: ReportPriority, default: ReportPriority.NORMALE })
  @IsEnum(ReportPriority)
  @IsOptional()
  priorite?: ReportPriority = ReportPriority.NORMALE;
}

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.ACCEPTE })
  @IsEnum(ReportStatus)
  nouveau_statut: ReportStatus;

  @ApiPropertyOptional({ example: 'https://storage.kalaa.tn/preuve-reparation.jpg', description: 'Obligatoire si statut = RESOLU' })
  @IsString()
  @IsOptional()
  photo_preuve_url?: string;

  @ApiPropertyOptional({ example: 'Hors périmètre municipal ou doublon avec KC-2026-0012' })
  @IsString()
  @IsOptional()
  motif_rejet_ou_doublon?: string;

  @ApiPropertyOptional({ example: 'Équipe technique mobilisée sur place' })
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiPropertyOptional({ example: 'usr-agent-voirie', description: 'ID de l’agent affecté' })
  @IsString()
  @IsOptional()
  agent_id?: string;
}

export class AddCommentDto {
  @ApiProperty({ example: 'Intervention programmée pour demain matin à 08h00' })
  @IsString()
  @IsNotEmpty({ message: 'Le texte du commentaire est requis' })
  texte: string;

  @ApiPropertyOptional({ default: false, description: 'Réservé aux échanges internes entre agents' })
  @IsOptional()
  est_interne?: boolean = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photo_preuve_url?: string;
}

export class FilterReportsDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  statut?: ReportStatus;

  @ApiPropertyOptional()
  @IsOptional()
  categorie_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  service_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  quartier?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}
