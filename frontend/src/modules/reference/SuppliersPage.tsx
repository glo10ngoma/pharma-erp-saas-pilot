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

export function SuppliersPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [supplierCode, setCode] = useState('');
  const [supplierName, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const query = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await referenceService.suppliers.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'suppliers', modalOpen], enabled: modalOpen && can('suppliers.create'), queryFn: async () => (await codeGeneratorService.next('suppliers')).data.code });
  const create = useMutation({ mutationFn: referenceService.suppliers.create, onSuccess: () => { setCode(''); setName(''); setPhone(''); setEmail(''); setAddress(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['suppliers'] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ supplierCode, supplierName, phone: phone || undefined, email: email || undefined, address: address || undefined }); }
  const rows = filterRows(query.data ?? [], search, (row) => [row.supplierCode, row.supplierName, row.phone, row.email, row.address]);
  const exportRows = useMemo(() => [['Code', 'Nom', 'Telephone', 'Email', 'Adresse', 'Statut'], ...rows.map((row) => [row.supplierCode, row.supplierName, row.phone ?? '-', row.email ?? '-', row.address ?? '-', row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Fournisseurs">
        <div className="reference-actions"><ReferenceExportActions baseName="fournisseurs" sheetName="Fournisseurs" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('suppliers.create') && <button className="button compact-button" onClick={openModal}>Nouveau fournisseur</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title="Nouveau fournisseur" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={supplierCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom fournisseur" value={supplierName} onChange={(e) => setName(e.target.value)} required /></label>
          <label><span>Telephone</span><input className="input compact-input" placeholder="+243..." value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label><span>Email</span><input className="input compact-input" placeholder="contact@..." value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label><span>Adresse</span><input className="input compact-input" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher code, nom, telephone, email..." /></div>
      <div className="card table-card">{query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucun fournisseur trouve.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Telephone</th><th>Email</th><th>Adresse</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.supplierId}><td><strong>{row.supplierCode}</strong></td><td>{row.supplierName}</td><td>{row.phone || '-'}</td><td>{row.email || '-'}</td><td>{row.address || '-'}</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
