import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedMulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('Téléversement Photos')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Téléversement d’une photo de signalement ou preuve (max 1 Mo, EXIF supprimé)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadFile(
    @UploadedFile() file?: UploadedMulterFile,
    @Body('base64') base64?: string,
    @Body('mimeType') mimeType?: string,
  ) {
    if (file) {
      return this.uploadsService.processAndUploadPhoto(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    }

    if (base64) {
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      return this.uploadsService.processAndUploadPhoto(
        buffer,
        'capture.jpg',
        mimeType || 'image/jpeg',
      );
    }

    throw new NotFoundException('Aucun fichier ni payload base64 fourni');
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Lecture d’une photo téléversée localement' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Évite toute tentative de path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(process.cwd(), 'uploads', safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé');
    }

    return res.sendFile(filePath);
  }
}
