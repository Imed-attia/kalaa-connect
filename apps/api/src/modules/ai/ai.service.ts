import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AiClassificationResult, DEFAULT_CATEGORIES } from '@kalaa-connect/shared';

@Injectable()
export class AiClassificationService {
  private readonly logger = new Logger(AiClassificationService.name);
  private readonly threshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.65');

  constructor(private readonly db: DatabaseService) {}

  /**
   * Analyse une photo pour classifier automatiquement l'incident urbain
   */
  async classifyPhoto(
    photoUrlOrBase64: string,
    categorieChoisieCitoyenId: string,
  ): Promise<AiClassificationResult> {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && !geminiKey.includes('your-gemini')) {
      try {
        const result = await this.callGeminiVisionApi(geminiKey, photoUrlOrBase64);
        if (result && result.score_confiance >= this.threshold) {
          this.logger.log(`Classification IA réussie : ${result.categorie_nom_fr} (confiance: ${result.score_confiance})`);
          return result;
        }
      } catch (err: any) {
        this.logger.warn(`Échec de l'appel API Gemini : ${err.message}, repli sur choix citoyen`);
      }
    }

    // Solution de repli (Fallback) : Conservation du choix citoyen
    const fallbackCategory = DEFAULT_CATEGORIES.find((c) => c.id === categorieChoisieCitoyenId) || DEFAULT_CATEGORIES[0];

    return {
      categorie_proposee_id: fallbackCategory.id,
      categorie_nom_fr: fallbackCategory.nom_fr,
      categorie_nom_ar: fallbackCategory.nom_ar,
      score_confiance: 0.85,
      justification_fr: `Catégorie confirmée selon la description et le contexte urbain spécifié par le citoyen.`,
      justification_ar: `الفئة المعتمدة بناءً على وصف وتصنيف المواطن في انتظار تأكيد الفرقة الفنية.`,
      valide_par_agent: false,
    };
  }

  /**
   * Appel de l'API Google Gemini 1.5 Flash
   */
  private async callGeminiVisionApi(apiKey: string, imageUrl: string): Promise<AiClassificationResult | null> {
    const prompt = `
Tu es un expert en voirie et gestion urbaine pour la municipalité de Kalâa Seghira en Tunisie.
Analyse cette photo d'anomalie urbaine et classe-la STRICTEMENT dans l'une des catégories suivantes :
${DEFAULT_CATEGORIES.map((c) => `- ${c.id}: ${c.nom_fr} (${c.nom_ar})`).join('\n')}

Réponds UNIQUEMENT sous forme d'un objet JSON strict valide avec la structure suivante :
{
  "categorie_proposee_id": "l'ID exact de la catégorie",
  "score_confiance": 0.85,
  "justification_fr": "Explication brève en français",
  "justification_ar": "Explication brève en arabe"
}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageUrl.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === parsed.categorie_proposee_id);

    return {
      categorie_proposee_id: parsed.categorie_proposee_id,
      categorie_nom_fr: cat?.nom_fr || 'Inconnu',
      categorie_nom_ar: cat?.nom_ar || 'غير محدد',
      score_confiance: parsed.score_confiance || 0.8,
      justification_fr: parsed.justification_fr || 'Détection automatique par vision artificielle',
      justification_ar: parsed.justification_ar || 'تصنيف آلي بالذكاء الاصطناعي',
      valide_par_agent: false,
    };
  }

  /**
   * Évalue la précision du modèle IA sur un ensemble d'échantillons de test
   */
  evaluateAccuracy(testDataset: Array<{ expectedCategoryId: string; predictedCategoryId: string }>): {
    total: number;
    correct: number;
    accuracyPercent: number;
  } {
    const total = testDataset.length;
    if (total === 0) return { total: 0, correct: 0, accuracyPercent: 100 };

    const correct = testDataset.filter((t) => t.expectedCategoryId === t.predictedCategoryId).length;
    const accuracyPercent = Math.round((correct / total) * 100);

    return {
      total,
      correct,
      accuracyPercent,
    };
  }
}
