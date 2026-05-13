import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'admin@company.kz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+77011234567' })
  @Matches(/^\+7\d{10}$/)
  phone!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Айнур' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Исаков' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: 'ТОО Логистика' })
  @IsString()
  @MinLength(3)
  companyName!: string;

  @ApiProperty({ example: '010640000123' })
  @Matches(/^\d{12}$/, { message: 'BIN must be 12 digits' })
  bin!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
