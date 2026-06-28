import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchBox } from '../../components/SearchBox';
import { filterRows } from '../../lib/search';
import { permissionsService } from '../../services/permissions.service';
import { AdminExportActions, AdminSummary } from '../administration/admin-ui';

export function PermissionsPage() {
  const queryClient = useQueryClient();
  const [permissionCode, setPermissionCode] = useState('');
  const [permissionName, setPermissionName] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await permissionsService.getAll()).data,
  });
  const create = useMutation({
    mutationFn: permissionsService.create,
    onSuccess: () => {
      setPermissionCode('');
      setPermissionName('');
      setModuleName('');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create.mutate({ permissionCode, permissionName, moduleName });
  }

  const rows = filterRows(data ?? [], search, (permission) => [permission.permissionCode, permission.permissionName, permission.moduleName]);
  const domains = Array.from(new Set((data ?? []).map((permission) => permission.moduleName))).sort();
  const exportRows = useMemo(() => [['Code', 'Nom', 'Domaine', 'Systeme'], ...rows.map((permission) => [permission.permissionCode, permission.permissionName, permission.moduleName, permission.isSystemPermission ? 'Oui' : 'Non'])], [rows]);
  return (
    <>
      <div className="page-heading reference-heading"><div><h1>Permissions</h1><p className="muted">Permissions regroupees par domaine fonctionnel.</p></div><AdminExportActions baseName="permissions" sheetName="Permissions" rows={exportRows} jsonData={rows} disabled={rows.length === 0} /></div>
      <AdminSummary cards={[{ label: 'Total', value: data?.length ?? 0 }, { label: 'Domaines', value: domains.length }, { label: 'Filtrees', value: rows.length }]} />
      <form className="card form-grid" onSubmit={submit}>
        <input className="input" placeholder="Code" value={permissionCode} onChange={(e) => setPermissionCode(e.target.value)} required />
        <input className="input" placeholder="Nom" value={permissionName} onChange={(e) => setPermissionName(e.target.value)} required />
        <input className="input" placeholder="Module" value={moduleName} onChange={(e) => setModuleName(e.target.value)} required />
        <button className="button" disabled={create.isPending}>Creer</button>
      </form>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher permission, domaine..." /></div>
      <div className="card">
        {isLoading ? 'Chargement...' : (
          <table className="data-table">
            <thead><tr><th>Code</th><th>Nom</th><th>Module</th></tr></thead>
            <tbody>{rows.map((permission) => (
              <tr key={permission.permissionId}><td>{permission.permissionCode}</td><td>{permission.permissionName}</td><td><span className="badge badge-muted">{permission.moduleName}</span></td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
