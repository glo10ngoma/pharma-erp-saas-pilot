import { AuthUser } from '../services/auth.service';

export function landingPathForUser(user: AuthUser | null | undefined) {
  const role = String(user?.role ?? '').toUpperCase();
  const permissions = user?.permissions ?? [];

  if ((role === 'ADMIN' || role === 'MANAGER') && permissions.includes('reports.dashboard')) {
    return '/reports/dashboard';
  }

  if (['VENDEUR', 'CAISSIER', 'CASHIER', 'SELLER'].includes(role) && permissions.includes('sales.create')) {
    return '/pos';
  }

  if (permissions.includes('reports.dashboard')) return '/reports/dashboard';
  if (permissions.includes('sales.create')) return '/pos';
  if (permissions.includes('articles.read')) return '/articles';
  return '/dashboard';
}
