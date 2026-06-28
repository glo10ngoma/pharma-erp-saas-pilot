import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { permissionsService } from '../../services/permissions.service';
import { rolesService } from '../../services/roles.service';
import { settingsService } from '../../services/settings.service';
import { sitesService } from '../../services/sites.service';
import { usersService } from '../../services/users.service';
import { fileDateStamp } from '../../utils/date';
import { downloadJson } from '../../utils/export';

export function SystemBackupsPage() {
  const configs = useQueries({
    queries: [
      { queryKey: ['sites', 'system-export'], queryFn: async () => (await sitesService.getAll()).data },
      { queryKey: ['users', 'system-export'], queryFn: async () => (await usersService.getAll()).data },
      { queryKey: ['roles', 'system-export'], queryFn: async () => (await rolesService.getAll()).data },
      { queryKey: ['permissions', 'system-export'], queryFn: async () => (await permissionsService.getAll()).data },
    ],
  });
  const exchangeRate = useQuery({ queryKey: ['settings', 'exchange-rate', 'system-export'], queryFn: async () => (await settingsService.getExchangeRate()).data });
  const loading = configs.some((query) => query.isLoading) || exchangeRate.isLoading;
  const payload = useMemo(() => ({
    exportedAt: new Date().toISOString(),
    sites: configs[0].data ?? [],
    users: configs[1].data ?? [],
    roles: configs[2].data ?? [],
    permissions: configs[3].data ?? [],
    settings: { exchangeRate: exchangeRate.data ?? null },
  }), [configs, exchangeRate.data]);
  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Sauvegardes</h1><p className="muted">Export systeme V1 sans dump base de donnees.</p></div>
        <button className="button compact-button" disabled={loading} onClick={() => downloadJson(`configuration_systeme_${fileDateStamp()}.json`, payload)}>Exporter configuration</button>
      </div>
      <div className="card">
        <h2>Sauvegardes automatiques</h2>
        <p className="muted">Les sauvegardes automatiques de la base sont gerees par Supabase/Railway selon l'environnement. Cette page fournit uniquement un export de configuration applicative.</p>
      </div>
      <div className="card detail-grid">
        <div><span>Sites</span><strong>{configs[0].data?.length ?? 0}</strong></div>
        <div><span>Utilisateurs</span><strong>{configs[1].data?.length ?? 0}</strong></div>
        <div><span>Roles</span><strong>{configs[2].data?.length ?? 0}</strong></div>
        <div><span>Permissions</span><strong>{configs[3].data?.length ?? 0}</strong></div>
      </div>
    </>
  );
}
