import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader } from './reference-ui';

type Props<T extends Record<string, unknown>> = {
  title: string;
  queryKey: string;
  entity?: string;
  codeLabel: string;
  nameLabel: string;
  codeField: keyof T;
  nameField: keyof T;
  idField: keyof T;
  createPermission?: string;
  getAll: () => Promise<{ data: T[] }>;
  create: (payload: Record<string, unknown>) => Promise<unknown>;
};

export function SimpleCodeNamePage<T extends Record<string, unknown>>(props: Props<T>) {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const canCreate = !props.createPermission || can(props.createPermission);
  const query = useQuery({ queryKey: [props.queryKey], queryFn: async () => (await props.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', props.entity, modalOpen], enabled: Boolean(props.entity && modalOpen && canCreate), queryFn: async () => (await codeGeneratorService.next(props.entity as string)).data.code });
  const create = useMutation({ mutationFn: props.create, onSuccess: () => { setCode(''); setName(''); setModalOpen(false); qc.invalidateQueries({ queryKey: [props.queryKey] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ [props.codeField]: code, [props.nameField]: name }); }
  const rows = filterRows(query.data ?? [], search, (row) => [row[props.codeField], row[props.nameField]]);
  const exportRows = useMemo(() => [
    ['Code', 'Nom', 'Statut'],
    ...rows.map((row) => [String(row[props.codeField] ?? ''), String(row[props.nameField] ?? ''), typeof row.isActive === 'boolean' ? (row.isActive ? 'Actif' : 'Inactif') : 'Actif']),
  ], [props.codeField, props.nameField, rows]);
  return (
    <>
      <ReferenceHeader title={props.title}>
        <div className="reference-actions">
          <ReferenceExportActions baseName={props.queryKey} sheetName={props.title} rows={exportRows} jsonData={rows} disabled={rows.length === 0} />
          {canCreate && <button className="button compact-button" type="button" onClick={openModal}>Nouveau</button>}
        </div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title={`Nouveau - ${props.title}`} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>{props.codeLabel}</span><input className="input compact-input" placeholder={nextCode.data ?? props.codeLabel} value={code || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>{props.nameLabel}</span><input className="input compact-input" placeholder={props.nameLabel} value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>{create.isPending ? 'Creation...' : 'Enregistrer'}</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} /></div>
      <div className="card table-card">
        {query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucune donnee trouvee.</p> : (
          <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={String(row[props.idField])}><td><strong>{String(row[props.codeField] ?? '')}</strong></td><td>{String(row[props.nameField] ?? '')}</td><td><ActiveBadge active={typeof row.isActive === 'boolean' ? Boolean(row.isActive) : true} /></td><td><button className="ghost-button compact-button" type="button" disabled>Voir</button></td></tr>)}</tbody></table></div>
        )}
      </div>
    </>
  );
}
