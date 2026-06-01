import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    return user;
  }

  findByEmail(email: string) {
    // Inclut le mot de passe pour la vérification lors du login
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(password, 10);
    const count = await this.prisma.user.count();

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: count === 0 ? 'admin' : 'guest',
      },
    });
  }
}
