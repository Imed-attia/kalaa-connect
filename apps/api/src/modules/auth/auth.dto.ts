import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole, AppLanguage } from '@kalaa-connect/shared';

export class RegisterDto {
  @ApiProperty({ example: 'Imed Attia', description: 'Nom complet du citoyen ou de l’agent' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom: string;

  @ApiProperty({ example: 'citoyen@kalaa-soghra.tn', description: 'Adresse email valide' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', description: 'Mot de passe sécurisé (min 6 car.)' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit comporter au moins 6 caractères' })
  mot_de_passe: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CITOYEN })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CITOYEN;

  @ApiPropertyOptional({ enum: AppLanguage, default: AppLanguage.FR })
  @IsEnum(AppLanguage)
  @IsOptional()
  langue?: AppLanguage = AppLanguage.FR;

  @ApiPropertyOptional({ example: '+21698123456' })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ description: 'ID du service municipal si rôle agent' })
  @IsString()
  @IsOptional()
  service_id?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'citoyen@kalaa-soghra.tn' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  mot_de_passe: string;
}
