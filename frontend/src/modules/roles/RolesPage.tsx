import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchBox } from '../../components/SearchBox';
import { filterRows } from '../../lib/search';
import { permissionsService } from '../../services/permissions.service';
import { rolesService } from '../../services/roles.service';
import { AdminExportActions, AdminSummary } from '../administration/admin-ui';

export function RolesPage() {
  const queryClient = useQueryClient();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await rolesService.getAll()).data,
  });
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await permissionsService.getAll()).data,
  });
  const create = useMutation({
    mutationFn: rolesService.create,
    onSuccess: () => {
      setRoleName('');
      setDescription('');
      setPermissionIds([]);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  function togglePermission(permissionId: string) {
    setPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((item) => item !== permissionId)
        : [...current, permissionId],
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create.mutate({ roleName, description, permissionIds });
  }

  const rows = filterRows(roles.data ?? [], search, (role) => [role.roleName, role.description, role.permissions.join(' ')]);
  const exportRows = useMemo(() => [['Role', 'Description', 'Permissions', 'Actif'], ...rows.map((role) => [role.roleName, role.description ?? '-', role.permissions.length, role.isActive ? 'Oui' : 'Non'])], [rows]);
  return (
    <>
      <div className="page-heading reference-heading"><div><h1>Roles</h1><p className="muted">Roles et permissions associees.</p></div><AdminExportActions baseName="roles" sheetName="Roles" rows={exportRows} jsonData={rows} disabled={rows.length === 0} /></div>
      <AdminSummary cards={[{ label: 'Total', value: roles.data?.length ?? 0 }, { label: 'Actifs', value: (roles.data ?? []).filter((role) => role.isActive).length }, { label: 'Permissions', value: (permissions.data ?? []).length }]} />
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher role, description, permission..." /></div>
      <form className="card" onSubmit={submit}>
        <div className="form-grid">
          <input className="input" placeholder="Nom role" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
          <input className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="button" disabled={create.isPending}>Creer</button>
        </div>
        <div className="checkbox-grid">
          {(permissions.data ?? []).map((permission) => (
            <label key={permission.permissionId}>
              <input type="checkbox" checked={permissionIds.includes(permission.permissionId)} onChange={() => togglePermission(permission.permissionId)} />
              {permission.permissionCode}
            </label>
          ))}
        </div>
      </form>
      <div className="card">
        {roles.isLoading ? 'Chargement...' : (
          <table className="data-table">
            <thead><tr><th>Role</th><th>Description</th><th>Permissions</th><th>Actif</th></tr></thead>
            <tbody>{rows.map((role) => (
              <tr key={role.roleId}><td>{role.roleName}</td><td>{role.description || '-'}</td><td>{role.permissions.join(', ')}</td><td>{role.isActive ? 'Oui' : 'Non'}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
