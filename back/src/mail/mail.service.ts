import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private client: Resend | null = null;

  private getClient(): Resend {
    if (!this.client) {
      this.client = new Resend(process.env.RESEND_API_KEY);
    }
    return this.client;
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

    await this.getClient().emails.send({
      from: `ChouxFleurs <${from}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe ChouxFleurs',
      html: `<p>Vous avez demandé la réinitialisation de votre mot de passe ChouxFleurs.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ce lien est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
    });
  }
}
