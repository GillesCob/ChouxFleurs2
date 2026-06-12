import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsDateString()
  termDate?: string | null;

  @IsOptional()
  @IsString()
  hint?: string | null;
}
