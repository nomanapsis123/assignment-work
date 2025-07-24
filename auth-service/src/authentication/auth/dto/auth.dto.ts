import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserTypesEnum } from 'src/authentication/common/enum';

export class AuthDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserTypesEnum)
  userType: UserTypesEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
