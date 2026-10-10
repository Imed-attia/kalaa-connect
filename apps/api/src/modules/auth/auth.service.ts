import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { User, UserRole, AppLanguage } from '@kalaa-connect/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly db: DatabaseService) {}

  async register(dto: RegisterDto): Promise<{ user: User; token: string }> {
    const supabase = this.db.getSupabase();

    // Mode Supabase
    if (supabase && this.db.mode === 'supabase') {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dto.email,
        password: dto.mot_de_passe,
        options: {
          data: {
            full_name: dto.nom,
            role: dto.role || UserRole.CITOYEN,
          },
        },
      });

      if (authError || !authData.user) {
        throw new BadRequestException(`Erreur d'inscription Supabase : ${authError?.message}`);
      }

      // Enregistrer dans la table utilisateurs
      const newUser: User = {
        id: authData.user.id,
        nom: dto.nom,
        email: dto.email,
        role: dto.role || UserRole.CITOYEN,
        langue: dto.langue || AppLanguage.FR,
        service_id: dto.service_id || null,
        telephone: dto.telephone || null,
        cree_le: new Date().toISOString(),
      };

      await supabase.from('utilisateurs').insert(newUser);

      return {
        user: newUser,
        token: authData.session?.access_token || `token-${newUser.id}`,
      };
    }

    // Mode local / Mock persistant
    const existing = Array.from(this.db.users.values()).find((u) => u.email === dto.email);
    if (existing) {
      throw new BadRequestException('Un utilisateur avec cette adresse email existe déjà');
    }

    const userId = `usr-${Date.now()}`;
    const newUser: User = {
      id: userId,
      nom: dto.nom,
      email: dto.email,
      role: dto.role || UserRole.CITOYEN,
      langue: dto.langue || AppLanguage.FR,
      service_id: dto.service_id || null,
      telephone: dto.telephone || null,
      cree_le: new Date().toISOString(),
    };

    this.db.users.set(userId, newUser);
    this.logger.log(`Nouvel utilisateur créé (mode local) : ${newUser.nom} (${newUser.email})`);

    return {
      user: newUser,
      token: `test-token-${newUser.role}`,
    };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const supabase = this.db.getSupabase();

    // Mode Supabase
    if (supabase && this.db.mode === 'supabase') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.mot_de_passe,
      });

      if (error || !data.user || !data.session) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      const { data: profile } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: User = {
        id: data.user.id,
        nom: profile?.nom || dto.email.split('@')[0],
        email: data.user.email!,
        role: profile?.role || UserRole.CITOYEN,
        langue: profile?.langue || AppLanguage.FR,
        service_id: profile?.service_id || null,
        cree_le: data.user.created_at,
      };

      return {
        user,
        token: data.session.access_token,
      };
    }

    // Mode local / Mock
    const found = Array.from(this.db.users.values()).find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
    if (!found) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return {
      user: found,
      token: `test-token-${found.role}`,
    };
  }

  async getMe(user: User): Promise<User> {
    return user;
  }
}
