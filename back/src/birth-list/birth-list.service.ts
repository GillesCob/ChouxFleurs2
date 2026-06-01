import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBirthListItemDto } from './dto/create-birth-list-item.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

const itemInclude = {
  contributions: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class BirthListService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: number) {
    return this.prisma.birthListItem.findMany({
      where: { projectId },
      include: itemInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateBirthListItemDto, userId: number) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.ownerId !== userId)
      throw new ForbiddenException('Seul le créateur du projet peut ajouter des articles');

    const { projectId, ...rest } = dto;
    return this.prisma.birthListItem.create({
      data: { ...rest, projectId, createdById: userId },
      include: itemInclude,
    });
  }

  async contribute(itemId: number, dto: CreateContributionDto, userId: number, userName: string) {
    const item = await this.prisma.birthListItem.findUnique({
      where: { id: itemId },
      include: { contributions: true },
    });
    if (!item) throw new NotFoundException(`Article #${itemId} introuvable`);

    const totalContributed = item.contributions.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );
    const price = Number(item.price);
    const remaining = price - totalContributed;

    if (remaining <= 0) {
      throw new BadRequestException('Cet article est déjà entièrement financé');
    }
    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Le montant dépasse le reste à financer (${remaining.toFixed(2)} €)`,
      );
    }

    return this.prisma.contribution.create({
      data: {
        amount: dto.amount,
        participantName: dto.participantName?.trim() || userName,
        birthListItemId: itemId,
        userId,
      },
    });
  }

  async removeContribution(contributionId: number, userId: number) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id: contributionId },
      include: { birthListItem: { include: { project: true } } },
    });
    if (!contribution) throw new NotFoundException('Participation introuvable');

    const isProjectOwner = contribution.birthListItem.project.ownerId === userId;
    const isContributor = contribution.userId === userId;
    if (!isProjectOwner && !isContributor) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cette participation');
    }

    await this.prisma.contribution.delete({ where: { id: contributionId } });
  }

  async remove(id: number, userId: number) {
    const item = await this.prisma.birthListItem.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!item) throw new NotFoundException(`Article #${id} introuvable`);
    if (item.project.ownerId !== userId)
      throw new ForbiddenException('Seul le créateur du projet peut supprimer des articles');
    await this.prisma.birthListItem.delete({ where: { id } });
  }
}
