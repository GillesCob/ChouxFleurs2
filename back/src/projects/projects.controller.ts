import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { RevealResultDto } from './dto/reveal-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: { id: number }) {
    return this.projectsService.create(dto.name, user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyProjects(@CurrentUser() user: { id: number }) {
    return this.projectsService.getMyProjects(user.id);
  }

  @Get('invite/:token')
  getByToken(@Param('token') token: string) {
    return this.projectsService.getByInviteToken(token);
  }

  @Post('join/:token')
  @UseGuards(JwtAuthGuard)
  joinByToken(@Param('token') token: string, @CurrentUser() user: { id: number }) {
    return this.projectsService.joinByToken(token, user);
  }

  @Post(':id/result')
  @UseGuards(JwtAuthGuard)
  revealResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RevealResultDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.projectsService.revealResult(id, dto, user.id);
  }
}
