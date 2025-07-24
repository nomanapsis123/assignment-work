import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';

export class CatalogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiPropertyOptional()
  @IsOptional()
  userId: any;

}
