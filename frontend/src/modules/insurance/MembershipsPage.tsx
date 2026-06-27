import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { insuranceService } from '../../services/insurance.service';
import { referenceService } from '../../services/reference.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader } from '../reference/reference-ui';

export function MembershipsPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [planId, setPlanId] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const customers = useQuery({ queryKey: ['customers'], queryFn: async () => (await referenceService.customers.getAll()).data });
  const organizations = useQuery({ queryKey: ['organizations'], queryFn: async () => (await insuranceService.organizations.getAll()).data });
  const plans = useQuery({ queryKey: ['insurance-plans'], queryFn: async () => (await insuranceService.plans.getAll()).data });
  const memberships = useQuery({ queryKey: ['memberships'], queryFn: async () => (await insuranceService.memberships.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'memberships', modalOpen], enabled: modalOpen && can('memberships.create'), queryFn: async () => (await codeGeneratorService.next('memberships')).data.code });
  const create = useMutation({ mutationFn: insuranceService.memberships.create, onSuccess: () => { setMemberNumber(''); setCustomerId(''); setOrganizationId(''); setPlanId(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['memberships'] }); } });
  function openModal() { setMemberNumber(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ customerId, organizationId, planId, memberNumber: memberNumber || undefined }); }
  const availablePlans = (plans.data ?? []).filter((plan) => !organizationId || plan.organizationId === organizationId);
  const rows = filterRows(memberships.data ?? [], search, (row) => [row.customerName, row.organizationName, row.planName, row.memberNumber, row.coveragePercent]);
  const exportRows = useMemo(() => [['Client', 'Assurance', 'Plan', 'Numero carte', 'Couverture %', 'Statut'], ...rows.map((row) => [row.customerName ?? '-', row.organizationName ?? '-', row.planName ?? '-', row.memberNumber ?? '-', row.coveragePercent ?? 0, row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Memberships assurance">
        <div className="reference-actions"><ReferenceExportActions baseName="memberships" sheetName="Memberships" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('memberships.create') && <button className="button compact-button" onClick={openModal}>Nouveau membership</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title="Nouveau membership" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Client</span><select className="input compact-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required><option value="">Client</option>{(customers.data ?? []).map((customer) => <option key={customer.customerId} value={customer.customerId}>{customer.customerName}</option>)}</select></label>
          <label><span>Assurance</span><select className="input compact-input" value={organizationId} onChange={(e) => { setOrganizationId(e.target.value); setPlanId(''); }} required><option value="">Organisation</option>{(organizations.data ?? []).filter((org) => org.isActive).map((org) => <option key={org.organizationId} value={org.organizationId}>{org.organizationName}</option>)}</select></label>
          <label><span>Plan</span><select className="input compact-input" value={planId} onChange={(e) => setPlanId(e.target.value)} required><option value="">Plan</option>{availablePlans.map((plan) => <option key={plan.planId} value={plan.planId}>{plan.planName} - {plan.coveragePercent}%</option>)}</select></label>
          <label><span>Numero carte</span><input className="input compact-input" placeholder={nextCode.data ?? 'Numero carte'} value={memberNumber || nextCode.data || ''} onChange={(e) => setMemberNumber(e.target.value)} /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher client, assurance, plan, carte..." /></div>
      <div className="card table-card">{memberships.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucune affiliation trouvee.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Client</th><th>Assurance</th><th>Plan</th><th>Numero carte</th><th>Couverture</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.membershipId}><td>{row.customerName ?? '-'}</td><td>{row.organizationName ?? '-'}</td><td>{row.planName ?? '-'}</td><td><strong>{row.memberNumber ?? '-'}</strong></td><td>{row.coveragePercent ?? 0}%</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
