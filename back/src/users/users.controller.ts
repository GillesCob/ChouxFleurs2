import { Body, Controller, Delete, Get, HttpCode, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Delete('me')
  @HttpCode(204)
  async deleteMe(@CurrentUser() user: { id: number }) {
    await this.usersService.deleteMe(user.id);
  }
}
