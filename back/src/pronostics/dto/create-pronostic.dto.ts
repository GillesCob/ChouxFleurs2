import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePronosticDto {
  @IsInt()
  projectId: number;

  @IsString()
  @MinLength(2)
  authorName: string;

  @IsEnum(['boy', 'girl', 'surprise'])
  gender: 'boy' | 'girl' | 'surprise';

  @IsDateString()
  birthDate: string;

  @IsInt()
  @Min(500)
  @Max(6000)
  weightGrams: number;

  @IsInt()
  @Min(30)
  @Max(70)
  heightCm: number;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsOptional()
  @IsString()
  message?: string;
}
