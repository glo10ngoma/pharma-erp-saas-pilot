import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { insuranceService } from '../../services/insurance.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader } from '../reference/reference-ui';

export function InsurancePlansPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [planCode, setCode] = useState('');
  const [planName, setName] = useState('');
  const [coveragePercent, setCoverage] = useState('80');
  const organizations = useQuery({ queryKey: ['organizations'], queryFn: async () => (await insuranceService.organizations.getAll()).data });
  const plans = useQuery({ queryKey: ['insurance-plans'], queryFn: async () => (await insuranceService.plans.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'insurance_plans', modalOpen], enabled: modalOpen && can('insurance_plans.create'), queryFn: async () => (await codeGeneratorService.next('insurance_plans')).data.code });
  const create = useMutation({ mutationFn: insuranceService.plans.create, onSuccess: () => { setCode(''); setName(''); setCoverage('80'); setOrganizationId(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['insurance-plans'] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ organizationId, planCode, planName, coveragePercent: Number(coveragePercent) }); }
  const rows = filterRows(plans.data ?? [], search, (row) => [row.organizationName, row.planCode, row.planName, row.coveragePercent]);
  const exportRows = useMemo(() => [['Organisation', 'Code', 'Nom plan', 'Couverture %', 'Statut'], ...rows.map((row) => [row.organizationName ?? '-', row.planCode, row.planName, row.coveragePercent, row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Plans assurance">
        <div className="reference-actions"><ReferenceExportActions baseName="plans_assurance" sheetName="Plans assurance" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('insurance_plans.create') && <button className="button compact-button" onClick={openModal}>Nouveau plan assurance</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title="Nouveau plan assurance" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Organisation</span><select className="input compact-input" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} required><option value="">Organisation</option>{(organizations.data ?? []).filter((org) => org.isActive).map((org) => <option key={org.organizationId} value={org.organizationId}>{org.organizationName}</option>)}</select></label>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={planCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom plan" value={planName} onChange={(e) => setName(e.target.value)} required /></label>
          <label><span>Couverture %</span><input className="input compact-input" type="number" min="0" max="100" value={coveragePercent} onChange={(e) => setCoverage(e.target.value)} required /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher organisation, code, plan..." /></div>
      <div className="card table-card">{plans.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucun plan trouve.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Organisation</th><th>Code</th><th>Nom plan</th><th>Couverture</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.planId}><td>{row.organizationName ?? '-'}</td><td><strong>{row.planCode}</strong></td><td>{row.planName}</td><td>{row.coveragePercent}%</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
