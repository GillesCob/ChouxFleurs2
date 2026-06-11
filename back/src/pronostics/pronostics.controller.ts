import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PronosticsService } from './pronostics.service';
import { CreatePronosticDto } from './dto/create-pronostic.dto';
import { UpdatePronosticDto } from './dto/update-pronostic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pronostics')
@UseGuards(JwtAuthGuard)
export class PronosticsController {
  constructor(private readonly pronosticsService: PronosticsService) {}

  @Get()
  findAll(@Query('projectId', ParseIntPipe) projectId: number) {
    return this.pronosticsService.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreatePronosticDto, @CurrentUser() user: { id: number }) {
    return this.pronosticsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePronosticDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.pronosticsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.pronosticsService.remove(id, user.id);
  }
}
