import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => !o.inviteToken)
  @IsString()
  @MinLength(2)
  projectName?: string;

  @IsOptional()
  @IsString()
  inviteToken?: string;
}
