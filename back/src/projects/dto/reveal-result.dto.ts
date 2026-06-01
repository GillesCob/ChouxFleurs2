import { IsDateString, IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class RevealResultDto {
  @IsEnum(['boy', 'girl'])
  gender: 'boy' | 'girl';

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
}
