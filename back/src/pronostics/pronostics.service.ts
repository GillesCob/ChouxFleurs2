import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePronosticDto } from './dto/create-pronostic.dto';
import { UpdatePronosticDto } from './dto/update-pronostic.dto';

@Injectable()
export class PronosticsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: number) {
    return this.prisma.pronostic.findMany({
      where: { projectId },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(dto: CreatePronosticDto, userId: number) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const existing = await this.prisma.pronostic.findFirst({
      where: { projectId: dto.projectId, userId },
    });
    if (existing) throw new ConflictException('Vous avez déjà soumis un pronostic pour ce projet');

    const { projectId, ...rest } = dto;
    return this.prisma.pronostic.create({
      data: {
        ...rest,
        birthDate: new Date(dto.birthDate),
        projectId,
        userId,
      },
    });
  }

  async update(id: number, dto: UpdatePronosticDto, userId: number) {
    const pronostic = await this.prisma.pronostic.findUnique({ where: { id } });
    if (!pronostic) throw new NotFoundException(`Pronostic #${id} introuvable`);
    if (pronostic.userId !== userId)
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre pronostic');

    return this.prisma.pronostic.update({
      where: { id },
      data: { ...dto, birthDate: new Date(dto.birthDate) },
    });
  }

  async remove(id: number, userId: number) {
    const pronostic = await this.prisma.pronostic.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!pronostic) throw new NotFoundException(`Pronostic #${id} introuvable`);
    if (pronostic.project.ownerId !== userId)
      throw new ForbiddenException('Seul le créateur du projet peut supprimer un pronostic');
    await this.prisma.pronostic.delete({ where: { id } });
  }
}
