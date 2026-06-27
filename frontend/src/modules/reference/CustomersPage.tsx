import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { referenceService } from '../../services/reference.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader } from './reference-ui';

export function CustomersPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customerCode, setCode] = useState('');
  const [customerName, setName] = useState('');
  const [customerType, setType] = useState('INDIVIDUAL');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const query = useQuery({ queryKey: ['customers'], queryFn: async () => (await referenceService.customers.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'customers', modalOpen], enabled: modalOpen && can('customers.create'), queryFn: async () => (await codeGeneratorService.next('customers')).data.code });
  const create = useMutation({ mutationFn: referenceService.customers.create, onSuccess: () => { setCode(''); setName(''); setPhone(''); setEmail(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['customers'] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ customerCode, customerName, phone: phone || undefined, email: email || undefined, customerType }); }
  const rows = filterRows(query.data ?? [], search, (row) => [row.customerCode, row.customerName, row.customerType, row.phone, row.email]);
  const exportRows = useMemo(() => [['Code', 'Nom', 'Telephone', 'Email', 'Type client', 'Statut'], ...rows.map((row) => [row.customerCode, row.customerName, row.phone ?? '-', row.email ?? '-', row.customerType, row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Clients">
        <div className="reference-actions"><ReferenceExportActions baseName="clients" sheetName="Clients" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('customers.create') && <button className="button compact-button" onClick={openModal}>Nouveau client</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title="Nouveau client" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={customerCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom client" value={customerName} onChange={(e) => setName(e.target.value)} required /></label>
          <label><span>Type</span><select className="input compact-input" value={customerType} onChange={(e) => setType(e.target.value)}><option value="INDIVIDUAL">INDIVIDUAL</option><option value="INSURANCE_MEMBER">INSURANCE_MEMBER</option><option value="COMPANY">COMPANY</option><option value="HOSPITAL">HOSPITAL</option><option value="NGO">NGO</option><option value="OTHER">OTHER</option></select></label>
          <label><span>Telephone</span><input className="input compact-input" placeholder="+243..." value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label><span>Email</span><input className="input compact-input" placeholder="client@..." value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher code, nom, telephone, email..." /></div>
      <div className="card table-card">{query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucun client trouve.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Telephone</th><th>Email</th><th>Type client</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.customerId}><td><strong>{row.customerCode}</strong></td><td>{row.customerName}</td><td>{row.phone || '-'}</td><td>{row.email || '-'}</td><td>{row.customerType}</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
