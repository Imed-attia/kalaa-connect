import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiClassificationService } from './ai.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Intelligence Artificielle')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiClassificationService) {}

  @Post('classify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Classification automatique d’une photo de signalement via Gemini Vision' })
  async classify(
    @Body('photoUrl') photoUrl: string,
    @Body('categorieId') categorieId: string,
  ) {
    return this.aiService.classifyPhoto(photoUrl, categorieId);
  }
}
