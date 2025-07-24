import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserTypesEnum } from 'src/authentication/common/enum';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiPropertyOptional()
  @IsEnum(UserTypesEnum, { each: true })
  @IsString()
  @IsOptional()
  readonly userType: UserTypesEnum;
}
