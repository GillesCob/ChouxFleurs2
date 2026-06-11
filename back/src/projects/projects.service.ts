import { randomUUID } from 'crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevealResultDto } from './dto/reveal-result.dto';
import { calculateScore } from './scoring.util';

const projectInclude = {
  owner: { select: { id: true, name: true } },
  birthResult: true,
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' as const },
  },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, ownerId: number) {
    return this.prisma.project.create({
      data: { name, ownerId, inviteToken: randomUUID() },
      include: projectInclude,
    });
  }

  async getMyProjects(userId: number) {
    const owned = await this.prisma.project.findMany({
      where: { ownerId: userId },
      include: projectInclude,
    });

    const memberProjects = await this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: projectInclude,
    });

    const all = [...owned, ...memberProjects];
    return Promise.all(all.map((p) => this.enrichWithWinner(p)));
  }

  async getByInviteToken(token: string) {
    const project = await this.prisma.project.findUnique({
      where: { inviteToken: token },
      include: { owner: { select: { id: true, name: true } } },
    });
    if (!project) throw new NotFoundException('Lien invalide ou projet introuvable');
    return { id: project.id, name: project.name, owner: { name: project.owner.name } };
  }

  async joinByToken(token: string, user: { id: number }) {
    const project = await this.prisma.project.findUnique({
      where: { inviteToken: token },
    });
    if (!project) throw new NotFoundException('Lien invalide');
    if (project.ownerId === user.id) return project;

    await this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      create: { projectId: project.id, userId: user.id },
      update: {},
    });
    return project;
  }

  async updateName(id: number, name: string, userId: number) {
    const isOwner = await this.isProjectOwner(id, userId);
    if (!isOwner) throw new ForbiddenException('Seul le créateur peut renommer le projet');
    const project = await this.prisma.project.update({
      where: { id },
      data: { name },
      include: projectInclude,
    });
    return this.enrichWithWinner(project);
  }

  async isProjectOwner(projectId: number, userId: number): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id: projectId, ownerId: userId },
    });
    return count > 0;
  }

  async revealResult(projectId: number, dto: RevealResultDto, userId: number) {
    const isOwner = await this.isProjectOwner(projectId, userId);
    if (!isOwner)
      throw new ForbiddenException('Seul le créateur du projet peut révéler les résultats');

    await this.prisma.birthResult.upsert({
      where: { projectId },
      create: { projectId, ...dto, birthDate: new Date(dto.birthDate) },
      update: { ...dto, birthDate: new Date(dto.birthDate) },
    });

    const pronostics = await this.prisma.pronostic.findMany({ where: { projectId } });
    await this.prisma.$transaction(
      pronostics.map((p) => {
        const { total, details } = calculateScore(p, { ...dto, birthDate: new Date(dto.birthDate) });
        return this.prisma.pronostic.update({
          where: { id: p.id },
          data: { score: total, scoreDetails: details as object },
        });
      }),
    );

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: projectInclude,
    });
    return this.enrichWithWinner(project);
  }

  private async enrichWithWinner(project: any) {
    const memberCount = project.members?.length ?? 0;

    let winner = null;
    if (project.birthResult) {
      winner = await this.prisma.pronostic.findFirst({
        where: { projectId: project.id, score: { not: null } },
        orderBy: { score: 'desc' },
      });
    }

    return {
      id: project.id,
      name: project.name,
      inviteToken: project.inviteToken,
      owner: project.owner,
      birthResult: project.birthResult,
      members: project.members ?? [],
      memberCount,
      winner,
      createdAt: project.createdAt,
    };
  }
}
