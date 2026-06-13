import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  termDate?: string | null;

  @IsOptional()
  @IsString()
  hint?: string | null;

  @IsOptional()
  @IsBoolean()
  pronosticsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  birthListEnabled?: boolean;
}
