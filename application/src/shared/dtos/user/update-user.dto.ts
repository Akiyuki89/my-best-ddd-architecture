import { IsOptional, IsString, IsEmail, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@shared/decorators/match.decorator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Updated UserName', description: 'Nome do usuário', required: false })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({ example: 'updatedemail@example.com', description: 'E-mail do usuário', required: false })
  @IsString()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({ example: 'NewP@ssw0rd!', description: 'Nova senha do usuário', minLength: 8, maxLength: 20, required: false })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'The password must have a maximum of 20 characters' })
  @Matches(/(?=.*\d)/, { message: 'The password must contain at least one number' })
  @Matches(/(?=.*[a-z])/, { message: 'The password must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'The password should contain at least 1 uppercase character' })
  @Matches(/(?=.*[!@#$%^&*])/, { message: 'The password must contain at least one special character' })
  readonly password?: string;

  @ApiProperty({ example: 'NewP@ssw0rd!', description: 'Confirmação da nova senha do usuário', minLength: 8, required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @Match('password', { message: 'Passwords do not match' })
  readonly confirmPassword?: string;

  @ApiProperty({ example: 'admin', description: 'Papel do usuário', required: false })
  @IsString()
  @IsOptional()
  readonly role?: string;
}
