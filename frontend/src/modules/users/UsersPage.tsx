import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { filterRows } from '../../lib/search';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { rolesService } from '../../services/roles.service';
import { sitesService } from '../../services/sites.service';
import { usersService } from '../../services/users.service';
import { AdminExportActions, AdminSummary } from '../administration/admin-ui';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [siteId, setSiteId] = useState('');
  const users = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersService.getAll()).data,
  });
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await rolesService.getAll()).data,
  });
  const sites = useQuery({
    queryKey: ['sites'],
    queryFn: async () => (await sitesService.getAll()).data,
  });
  const nextCode = useQuery({ queryKey: ['next-code', 'users', modalOpen], enabled: modalOpen, queryFn: async () => (await codeGeneratorService.next('users')).data.code });
  const create = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  useEffect(() => {
    if (modalOpen && !username && nextCode.data) setUsername(nextCode.data.toLowerCase());
  }, [modalOpen, nextCode.data, username]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create.mutate({ fullName, username, email, password, roleId, siteId });
  }

  const rows = filterRows(users.data ?? [], search, (user) => [user.fullName, user.username, user.email, user.roleName, user.siteName])
    .filter((user) => !roleFilter || user.roleId === roleFilter)
    .filter((user) => !siteFilter || user.siteId === siteFilter)
    .filter((user) => !statusFilter || String(user.isActive) === statusFilter);
  const exportRows = useMemo(() => [['Nom', 'Username', 'Email', 'Role', 'Site', 'Actif'], ...rows.map((user) => [user.fullName, user.username, user.email ?? '-', user.roleName ?? '-', user.siteName ?? '-', user.isActive ? 'Oui' : 'Non'])], [rows]);
  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Utilisateurs</h1><p className="muted">Comptes, roles et sites rattaches.</p></div>
        <div className="reference-actions"><AdminExportActions baseName="utilisateurs" sheetName="Utilisateurs" rows={exportRows} jsonData={rows} disabled={rows.length === 0} /><button className="button compact-button" onClick={() => setModalOpen(true)}>Nouvel utilisateur</button></div>
      </div>
      <AdminSummary cards={[{ label: 'Total', value: users.data?.length ?? 0 }, { label: 'Actifs', value: (users.data ?? []).filter((user) => user.isActive).length }, { label: 'Inactifs', value: (users.data ?? []).filter((user) => !user.isActive).length }, { label: 'Admins', value: (users.data ?? []).filter((user) => user.roleName === 'ADMIN').length }]} />
      <Modal title="Nouvel utilisateur" open={modalOpen} onClose={() => setModalOpen(false)}>
      <form className="form-grid" onSubmit={submit}>
        <input className="input" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
          <option value="">Role</option>
          {(roles.data ?? []).map((role) => <option key={role.roleId} value={role.roleId}>{role.roleName}</option>)}
        </select>
        <select className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)} required>
          <option value="">Site</option>
          {(sites.data ?? []).map((site) => <option key={site.siteId} value={site.siteId}>{site.siteName}</option>)}
        </select>
        <button className="button" disabled={create.isPending}>Creer</button>
      </form>
      </Modal>
      <div className="card reference-filters admin-user-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher un utilisateur..." /><select className="input compact-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="">Tous roles</option>{(roles.data ?? []).map((role) => <option key={role.roleId} value={role.roleId}>{role.roleName}</option>)}</select><select className="input compact-input" value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}><option value="">Tous sites</option>{(sites.data ?? []).map((site) => <option key={site.siteId} value={site.siteId}>{site.siteName}</option>)}</select><select className="input compact-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Tous statuts</option><option value="true">Actifs</option><option value="false">Inactifs</option></select></div>
      <div className="card">
        {users.isLoading ? <p className="loading-state">Chargement des utilisateurs...</p> : rows.length === 0 ? <p className="empty-state">Aucun utilisateur trouve.</p> : (
          <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nom</th><th>Username</th><th>Email</th><th>Role</th><th>Site</th><th>Actif</th></tr></thead>
            <tbody>{rows.map((user) => (
              <tr key={user.userId}><td>{user.fullName}</td><td>{user.username}</td><td>{user.email || '-'}</td><td>{user.roleName || '-'}</td><td>{user.siteName || '-'}</td><td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-muted'}`}>{user.isActive ? 'Actif' : 'Inactif'}</span></td></tr>
            ))}</tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
}
