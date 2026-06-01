import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto.name, dto.email, dto.password);

    if (dto.inviteToken) {
      await this.projectsService.joinByToken(dto.inviteToken, user as any).catch(() => null);
    } else if (dto.projectName) {
      await this.projectsService.create(dto.projectName, user.id);
    }

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants incorrects');

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: Record<string, any>) {
    const { password: _pw, ...safeUser } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { access_token: token, user: safeUser };
  }
}
