import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { insuranceService } from '../../services/insurance.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader, ReferenceSummary, summarizeActive } from '../reference/reference-ui';

export function OrganizationsPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [organizationCode, setCode] = useState('');
  const [organizationName, setName] = useState('');
  const [organizationType, setType] = useState('INSURANCE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const query = useQuery({ queryKey: ['organizations'], queryFn: async () => (await insuranceService.organizations.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'organizations', modalOpen], enabled: modalOpen && can('organizations.create'), queryFn: async () => (await codeGeneratorService.next('organizations')).data.code });
  const create = useMutation({ mutationFn: insuranceService.organizations.create, onSuccess: () => { setCode(''); setName(''); setPhone(''); setEmail(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['organizations'] }); } });
  const disable = useMutation({ mutationFn: insuranceService.organizations.disable, onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }) });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ organizationCode, organizationName, organizationType, phone: phone || undefined, email: email || undefined }); }
  const rows = filterRows(query.data ?? [], search, (row) => [row.organizationCode, row.organizationName, row.organizationType, row.phone, row.email]);
  const summary = summarizeActive(query.data ?? []);
  const exportRows = useMemo(() => [['Code', 'Nom', 'Type', 'Telephone', 'Email', 'Statut'], ...rows.map((row) => [row.organizationCode, row.organizationName, row.organizationType, row.phone ?? '-', row.email ?? '-', row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Organisations assurance">
        <div className="reference-actions"><ReferenceExportActions baseName="organisations" sheetName="Organisations" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('organizations.create') && <button className="button compact-button" onClick={openModal}>Nouvelle organisation</button>}</div>
      </ReferenceHeader>
      {(create.isError || disable.isError) && <p className="form-error">{apiErrorMessage(create.error || disable.error)}</p>}
      <ReferenceSummary total={(query.data ?? []).length} filtered={rows.length} active={summary.active} inactive={summary.inactive} />
      <Modal title="Nouvelle organisation" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={organizationCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom organisation" value={organizationName} onChange={(e) => setName(e.target.value)} required /></label>
          <label><span>Type</span><select className="input compact-input" value={organizationType} onChange={(e) => setType(e.target.value)}><option value="INSURANCE">INSURANCE</option><option value="COMPANY">COMPANY</option><option value="NGO">NGO</option><option value="HOSPITAL">HOSPITAL</option><option value="OTHER">OTHER</option></select></label>
          <label><span>Telephone</span><input className="input compact-input" placeholder="+243..." value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label><span>Email</span><input className="input compact-input" placeholder="contact@..." value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher code, nom, telephone, email..." /></div>
      <div className="card table-card">{query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucune organisation trouvee.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Type</th><th>Telephone</th><th>Email</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.organizationId}><td><strong>{row.organizationCode}</strong></td><td>{row.organizationName}</td><td>{row.organizationType}</td><td>{row.phone || '-'}</td><td>{row.email || '-'}</td><td><ActiveBadge active={row.isActive} /></td><td>{row.isActive && can('organizations.disable') ? <button className="ghost-button compact-button danger" disabled={disable.isPending} onClick={() => disable.mutate(row.organizationId)}>Desactiver</button> : <button className="ghost-button compact-button" disabled>Voir</button>}</td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
