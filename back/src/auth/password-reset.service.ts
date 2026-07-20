import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async requestReset(email: string): Promise<{ message: string }> {
    const genericMessage = {
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };

    const user = await this.usersService.findByEmail(email);
    if (!user) return genericMessage;

    const rawToken = crypto.randomUUID();
    const hashedToken = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordResetToken.create({
      data: { token: hashedToken, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
    await this.mailService.sendPasswordResetEmail(email, resetUrl);

    return genericMessage;
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = this.hashToken(rawToken);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      throw new NotFoundException('Lien de réinitialisation invalide ou déjà utilisé');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      throw new NotFoundException('Lien de réinitialisation expiré, faites une nouvelle demande');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    await this.prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { message: 'Mot de passe réinitialisé' };
  }
}
