import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User, UserRole, AppLanguage } from '@kalaa-connect/shared';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Jeton d’authentification manquant (Bearer token requis)');
    }

    const token = authHeader.substring(7).trim();

    // 1. Gestion des jetons de développement et de tests
    if (token.startsWith('test-token-') || token.startsWith('usr-')) {
      const user = this.resolveDevToken(token);
      if (user) {
        request.user = user;
        return true;
      }
    }

    // 2. Vérification auprès de Supabase Auth si configuré
    const supabase = this.db.getSupabase();
    if (supabase && this.db.mode === 'supabase') {
      try {
        const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
        if (error || !sbUser) {
          throw new UnauthorizedException(`Session Supabase invalide : ${error?.message || 'Utilisateur inconnu'}`);
        }

        // Récupérer le profil applicatif avec son rôle
        const { data: profile } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        request.user = {
          id: sbUser.id,
          nom: profile?.nom || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Utilisateur',
          email: sbUser.email!,
          role: profile?.role || UserRole.CITOYEN,
          langue: profile?.langue || AppLanguage.FR,
          service_id: profile?.service_id || null,
          cree_le: sbUser.created_at,
        };
        return true;
      } catch (err: any) {
        this.logger.warn(`Échec de validation JWT Supabase : ${err.message}`);
        throw new UnauthorizedException('Session expirée ou non autorisée');
      }
    }

    // Si on est en mode mock, chercher l'utilisateur par ID ou token générique
    const foundUser = Array.from(this.db.users.values()).find(
      (u) => u.id === token || u.email === token,
    );

    if (foundUser) {
      request.user = foundUser;
      return true;
    }

    // Utilisateur par défaut de test citoyen si jeton quelconque fourni en dev
    request.user = this.db.users.get('usr-citoyen-nada') || {
      id: 'usr-citoyen-nada',
      nom: 'Nada Slama',
      email: 'nada.slama@esprit.tn',
      role: UserRole.CITOYEN,
      langue: AppLanguage.FR,
      cree_le: new Date().toISOString(),
    };

    return true;
  }

  private resolveDevToken(token: string): User | undefined {
    if (token === 'test-token-citoyen' || token === 'usr-citoyen-nada') {
      return this.db.users.get('usr-citoyen-nada');
    }
    if (token === 'usr-citoyen-imed') {
      return this.db.users.get('usr-citoyen-imed');
    }
    if (token === 'test-token-admin' || token === 'usr-admin-dalila') {
      return this.db.users.get('usr-admin-dalila') || this.db.users.get('usr-admin-municipal');
    }
    if (token === 'test-token-agent' || token === 'usr-agent-voirie' || token === 'usr-agent-ali') {
      return this.db.users.get('usr-agent-ali') || this.db.users.get('usr-agent-voirie');
    }
    if (token === 'test-token-agent-proprete' || token === 'usr-agent-proprete' || token === 'usr-agent-sami') {
      return this.db.users.get('usr-agent-sami') || this.db.users.get('usr-agent-proprete');
    }
    return this.db.users.get(token);
  }
}
