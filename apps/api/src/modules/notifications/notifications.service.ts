import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportStatus, AppLanguage } from '@kalaa-connect/shared';

export interface EmailPayload {
  to: string;
  subjectFr: string;
  subjectAr: string;
  htmlFr: string;
  htmlAr: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Envoie un email transactionnel bilingue avec retry automatique en cas d'échec
   */
  async sendBilingualNotification(
    recipientEmail: string,
    report: Report,
    targetStatus: ReportStatus,
    langue: AppLanguage = AppLanguage.FR,
  ): Promise<boolean> {
    const payload = this.generateNotificationContent(report, targetStatus);
    payload.to = recipientEmail;

    return this.sendWithRetry(payload, 3);
  }

  private async sendWithRetry(payload: EmailPayload, maxAttempts = 3): Promise<boolean> {
    let attempt = 1;
    const provider = process.env.EMAIL_PROVIDER || 'mock';

    while (attempt <= maxAttempts) {
      try {
        if (provider === 'resend' && process.env.RESEND_API_KEY) {
          // Appel API Resend (fetch natif Node)
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'Kalaa Connect <noreply@kalaa-connect.tn>',
              to: [payload.to],
              subject: `${payload.subjectFr} / ${payload.subjectAr}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <div style="border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 20px;">
                    <h2 style="color: #16a34a; margin: 0;">Kalaa Connect — بلدية القلعة الصغرى</h2>
                  </div>
                  <div>${payload.htmlFr}</div>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                  <div dir="rtl" style="text-align: right;">${payload.htmlAr}</div>
                </div>
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`Resend API HTTP ${response.status}`);
          }
          this.logger.log(`Email envoyé via Resend à ${payload.to}`);
          return true;
        }

        // Mode Mock / Journalisation développement
        this.logger.log(`[EMAIL SIMULATION] Destinataire: ${payload.to} | Sujet: ${payload.subjectFr} / ${payload.subjectAr}`);
        this.logger.debug(`Contenu FR: ${payload.htmlFr}`);
        return true;
      } catch (err: any) {
        this.logger.warn(`Tentative ${attempt}/${maxAttempts} d'envoi d'email échouée : ${err.message}`);
        attempt++;
        if (attempt <= maxAttempts) {
          await new Promise((res) => setTimeout(res, 1000 * attempt)); // Backoff exponentiel
        }
      }
    }

    this.logger.error(`Échec définitif d'envoi d'email à ${payload.to} après ${maxAttempts} tentatives`);
    return false;
  }

  private generateNotificationContent(report: Report, status: ReportStatus): EmailPayload {
    switch (status) {
      case ReportStatus.ACCEPTE:
        return {
          to: '',
          subjectFr: `[Kalaa Connect] Votre signalement #${report.numero_ticket} a été accepté`,
          subjectAr: `[Kalaa Connect] تم قبول بلاغكم رقم #${report.numero_ticket}`,
          htmlFr: `
            <p>Bonjour,</p>
            <p>Votre signalement concernant <strong>"${report.titre}"</strong> a été pris en charge par les services municipaux.</p>
            <p>Statut actuel : <strong style="color: #2563eb;">ACCEPTÉ</strong>.</p>
            <p>Une équipe technique prépare l'intervention sur le terrain.</p>
          `,
          htmlAr: `
            <p>مرحباً،</p>
            <p>تم قبول بلاغكم بخصوص <strong>"${report.titre}"</strong> من قبل المصالح البلدية المختصة.</p>
            <p>الحالة الحالية: <strong style="color: #2563eb;">مقبول</strong>.</p>
            <p>فريق العمل بصدد برمجة التدخل الميداني.</p>
          `,
        };

      case ReportStatus.RESOLU:
        return {
          to: '',
          subjectFr: `[Kalaa Connect] Incident #${report.numero_ticket} résolu par la municipalité`,
          subjectAr: `[Kalaa Connect] تم حل المشكل المبلّغ عنه رقم #${report.numero_ticket}`,
          htmlFr: `
            <p>Bonjour,</p>
            <p>Les services municipaux ont terminé l'intervention pour le signalement : <strong>"${report.titre}"</strong>.</p>
            <p>Statut : <strong style="color: #16a34a;">RÉSOLU</strong>.</p>
            ${report.photo_preuve_url ? `<p><img src="${report.photo_preuve_url}" alt="Preuve" style="max-width: 100%; border-radius: 6px;" /></p>` : ''}
            <p>Merci de vous connecter sur l'application pour confirmer la clôture.</p>
          `,
          htmlAr: `
            <p>مرحباً،</p>
            <p>أنهت الفرق البلدية التدخل الخاص ببلاغكم: <strong>"${report.titre}"</strong>.</p>
            <p>الحالة: <strong style="color: #16a34a;">تم الحل</strong>.</p>
            ${report.photo_preuve_url ? `<p><img src="${report.photo_preuve_url}" alt="صورة إثبات" style="max-width: 100%; border-radius: 6px;" /></p>` : ''}
            <p>يرجى الدخول إلى المنصة لتأكيد الغلق النهائي للبلاغ.</p>
          `,
        };

      default:
        return {
          to: '',
          subjectFr: `[Kalaa Connect] Mise à jour du signalement #${report.numero_ticket}`,
          subjectAr: `[Kalaa Connect] تحيين البلاغ رقم #${report.numero_ticket}`,
          htmlFr: `<p>Votre ticket #${report.numero_ticket} est maintenant au statut : <strong>${status}</strong>.</p>`,
          htmlAr: `<p>تم تغيير حالة البلاغ رقم #${report.numero_ticket} إلى: <strong>${status}</strong>.</p>`,
        };
    }
  }
}
