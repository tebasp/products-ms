import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public price: number;
}
