import { IsInt, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class CreateBirthListItemDto {
  @IsInt()
  projectId: number;

  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  imageUrl: string;

  @IsUrl()
  productUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}
