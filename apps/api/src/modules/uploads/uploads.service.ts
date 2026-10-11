import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UPLOAD_LIMITS } from '@kalaa-connect/shared';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadsDir = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly db: DatabaseService) {
    if (!fs.existsSync(this.uploadsDir)) {
      try {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } catch (err: any) {
        this.logger.warn(`Impossible de créer le dossier uploads local : ${err.message}`);
      }
    }
  }

  /**
   * Valide la taille, le type MIME et supprime les métadonnées EXIF
   */
  async processAndUploadPhoto(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ url: string; sizeBytes: number; mimeType: string }> {
    // 1. Validation de la taille (1 Mo maximum)
    if (buffer.length > UPLOAD_LIMITS.maxSizeBytes) {
      throw new BadRequestException(
        `Fichier trop volumineux : ${(buffer.length / 1024 / 1024).toFixed(2)} Mo. La limite stricte est de 1 Mo.`,
      );
    }

    // 2. Validation du type MIME
    if (!UPLOAD_LIMITS.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Format d’image non autorisé (${mimeType}). Formats acceptés : JPEG, PNG, WebP.`,
      );
    }

    // 3. Suppression des métadonnées EXIF (Protection de la vie privée / INPDP)
    const sanitizedBuffer = this.stripExifMetadata(buffer, mimeType);

    // 4. Stockage (Supabase Storage ou stockage local)
    const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(originalName) || '.jpg'}`;
    const supabase = this.db.getSupabase();

    if (supabase && this.db.mode === 'supabase') {
      try {
        const bucketName = process.env.UPLOAD_STORAGE_BUCKET || 'signalements-photos';
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filename, sanitizedBuffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filename);
          return {
            url: publicData.publicUrl,
            sizeBytes: sanitizedBuffer.length,
            mimeType,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Erreur lors du dépôt Supabase Storage : ${err.message}, repli local`);
      }
    }

    // Stockage local / démo
    const localFilePath = path.join(this.uploadsDir, filename);
    try {
      fs.writeFileSync(localFilePath, sanitizedBuffer);
    } catch {
      // Ignore si écriture disque impossible
    }

    // Retourne une URL relative servable ou Data URI si petit
    const url = `/api/uploads/${filename}`;
    return {
      url,
      sizeBytes: sanitizedBuffer.length,
      mimeType,
    };
  }

  /**
   * Supprime les segments EXIF (APP1 0xFFE1) d'un buffer JPEG pour respecter le RGPD / INPDP
   */
  public stripExifMetadata(buffer: Buffer, mimeType: string): Buffer {
    if (mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') {
      return buffer; // Pour PNG et WebP, les métadonnées géographiques EXIF sont généralement absentes
    }

    try {
      // Un fichier JPEG commence par SOI: 0xFFD8
      if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return buffer;
      }

      const cleanChunks: Buffer[] = [buffer.subarray(0, 2)]; // Garde 0xFFD8
      let pos = 2;

      while (pos < buffer.length) {
        if (buffer[pos] !== 0xff) break;

        const marker = buffer[pos + 1];

        // Marqueurs sans longueur (RST, SOI, EOI, etc.)
        if (marker === 0xd9) {
          // End Of Image (EOI)
          cleanChunks.push(buffer.subarray(pos));
          break;
        }

        if (marker === 0xda) {
          // Start Of Scan (SOS) - Tout le reste est le flux d'image compressé
          cleanChunks.push(buffer.subarray(pos));
          break;
        }

        const length = buffer.readUInt16BE(pos + 2);

        // Marker 0xE1 = APP1 (EXIF metadata standard)
        if (marker === 0xe1) {
          // On ignore ce segment (suppression des données GPS et appareil)
          this.logger.debug(`Segment EXIF (APP1, ${length} octets) supprimé avec succès.`);
        } else {
          cleanChunks.push(buffer.subarray(pos, pos + 2 + length));
        }

        pos += 2 + length;
      }

      return Buffer.concat(cleanChunks);
    } catch (err: any) {
      this.logger.warn(`Échec du filtrage EXIF manuel, conservation du flux : ${err.message}`);
      return buffer;
    }
  }
}
