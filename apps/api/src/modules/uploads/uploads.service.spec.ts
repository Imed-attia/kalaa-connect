import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, DatabaseService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('doit rejeter les fichiers dépassant la limite de 1 Mo (1048576 octets)', async () => {
    const hugeBuffer = Buffer.alloc(1048576 + 500); // 1 Mo + 500 octets
    await expect(
      service.processAndUploadPhoto(hugeBuffer, 'grosse_photo.jpg', 'image/jpeg'),
    ).rejects.toThrow(BadRequestException);
  });

  it('doit rejeter les formats non autorisés (ex: PDF ou exécutable)', async () => {
    const buffer = Buffer.alloc(100);
    await expect(
      service.processAndUploadPhoto(buffer, 'document.pdf', 'application/pdf'),
    ).rejects.toThrow(BadRequestException);
  });

  it('doit accepter une photo JPEG valide inférieure à 1 Mo', async () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);
    const result = await service.processAndUploadPhoto(validJpeg, 'test.jpg', 'image/jpeg');

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('doit filtrer les métadonnées EXIF (APP1 0xFFE1) d’une image JPEG', () => {
    // Entête JPEG SOI (0xFFD8) + segment APP1 (0xFFE1) avec données bidon + segment SOS (0xFFDA)
    const exifSegment = Buffer.from([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const imagePayload = Buffer.from([0xff, 0xda, 0x00, 0x02, 0x12, 0x34, 0xff, 0xd9]);
    const mockJpegWithExif = Buffer.concat([Buffer.from([0xff, 0xd8]), exifSegment, imagePayload]);

    const sanitized = service.stripExifMetadata(mockJpegWithExif, 'image/jpeg');

    // Vérifier que le marqueur 0xFFE1 n'apparaît plus dans l'en-tête
    expect(sanitized.indexOf(Buffer.from([0xff, 0xe1]))).toBe(-1);
    expect(sanitized.length).toBeLessThan(mockJpegWithExif.length);
  });
});
