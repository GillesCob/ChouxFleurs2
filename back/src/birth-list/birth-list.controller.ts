import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BirthListService } from './birth-list.service';
import { CreateBirthListItemDto } from './dto/create-birth-list-item.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('birth-list')
@UseGuards(JwtAuthGuard)
export class BirthListController {
  constructor(private readonly birthListService: BirthListService) {}

  @Get()
  findAll(@Query('projectId', ParseIntPipe) projectId: number) {
    return this.birthListService.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreateBirthListItemDto, @CurrentUser() user: { id: number }) {
    return this.birthListService.create(dto, user.id);
  }

  @Post(':id/contributions')
  contribute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContributionDto,
    @CurrentUser() user: { id: number; name: string },
  ) {
    return this.birthListService.contribute(id, dto, user.id, user.name);
  }

  @Delete('contributions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContribution(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.birthListService.removeContribution(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.birthListService.remove(id, user.id);
  }
}
