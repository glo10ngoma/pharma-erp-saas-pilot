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

export function CategoriesPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryCode, setCode] = useState('');
  const [categoryName, setName] = useState('');
  const [description, setDescription] = useState('');
  const query = useQuery({ queryKey: ['categories'], queryFn: async () => (await referenceService.categories.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'categories', modalOpen], enabled: modalOpen && can('categories.create'), queryFn: async () => (await codeGeneratorService.next('categories')).data.code });
  const create = useMutation({ mutationFn: referenceService.categories.create, onSuccess: () => { setCode(''); setName(''); setDescription(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['categories'] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ categoryCode, categoryName, description: description || undefined }); }
  const rows = filterRows(query.data ?? [], search, (category) => [category.categoryCode, category.categoryName, category.description]);
  const exportRows = useMemo(() => [['Code', 'Nom', 'Description', 'Statut'], ...rows.map((row) => [row.categoryCode, row.categoryName, row.description ?? '', row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Categories">
        <div className="reference-actions"><ReferenceExportActions baseName="categories" sheetName="Categories" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('categories.create') && <button className="button compact-button" onClick={openModal}>Nouvelle categorie</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <Modal title="Nouvelle categorie" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={categoryCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom categorie" value={categoryName} onChange={(e) => setName(e.target.value)} required /></label>
          <label><span>Description</span><input className="input compact-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher code, nom, description..." /></div>
      <div className="card table-card">{query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucune categorie trouvee.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Description</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.categoryId}><td><strong>{row.categoryCode}</strong></td><td>{row.categoryName}</td><td>{row.description ?? '-'}</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
