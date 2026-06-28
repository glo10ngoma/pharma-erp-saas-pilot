import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { usePermission } from '../../hooks/usePermission';
import { filterRows } from '../../lib/search';
import { apiErrorMessage } from '../../services/apiError';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { referenceService } from '../../services/reference.service';
import { ActiveBadge, ReferenceExportActions, ReferenceHeader, ReferenceSummary, summarizeActive } from './reference-ui';

export function SubCategoriesPage() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryCode, setCode] = useState('');
  const [subCategoryName, setName] = useState('');
  const categories = useQuery({ queryKey: ['categories'], queryFn: async () => (await referenceService.categories.getAll()).data });
  const query = useQuery({ queryKey: ['sub-categories'], queryFn: async () => (await referenceService.subCategories.getAll()).data });
  const nextCode = useQuery({ queryKey: ['next-code', 'sub_categories', modalOpen], enabled: modalOpen && can('sub_categories.create'), queryFn: async () => (await codeGeneratorService.next('sub_categories')).data.code });
  const create = useMutation({ mutationFn: referenceService.subCategories.create, onSuccess: () => { setCode(''); setName(''); setCategoryId(''); setModalOpen(false); qc.invalidateQueries({ queryKey: ['sub-categories'] }); } });
  function openModal() { setCode(nextCode.data ?? ''); setModalOpen(true); }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); create.mutate({ categoryId, subCategoryCode, subCategoryName }); }
  const rows = filterRows(query.data ?? [], search, (row) => [row.subCategoryCode, row.subCategoryName, row.categoryName]);
  const summary = summarizeActive(query.data ?? []);
  const exportRows = useMemo(() => [['Code', 'Nom', 'Parent', 'Statut'], ...rows.map((row) => [row.subCategoryCode, row.subCategoryName, row.categoryName ?? '-', row.isActive ? 'Actif' : 'Inactif'])], [rows]);
  return (
    <>
      <ReferenceHeader title="Sous-categories">
        <div className="reference-actions"><ReferenceExportActions baseName="sous_categories" sheetName="Sous categories" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />{can('sub_categories.create') && <button className="button compact-button" onClick={openModal}>Nouvelle sous-categorie</button>}</div>
      </ReferenceHeader>
      {create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}
      <ReferenceSummary total={(query.data ?? []).length} filtered={rows.length} active={summary.active} inactive={summary.inactive} />
      <Modal title="Nouvelle sous-categorie" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid reference-form" onSubmit={submit}>
          <label><span>Parent</span><select className="input compact-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required><option value="">Categorie</option>{(categories.data ?? []).map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label>
          <label><span>Code</span><input className="input compact-input" placeholder={nextCode.data ?? 'Code'} value={subCategoryCode || nextCode.data || ''} onChange={(e) => setCode(e.target.value)} required /></label>
          <label><span>Nom</span><input className="input compact-input" placeholder="Nom sous-categorie" value={subCategoryName} onChange={(e) => setName(e.target.value)} required /></label>
          <div className="modal-actions"><button className="ghost-button compact-button" type="button" onClick={() => setModalOpen(false)}>Annuler</button><button className="button compact-button" disabled={create.isPending}>Enregistrer</button></div>
        </form>
      </Modal>
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher code, nom, parent..." /></div>
      <div className="card table-card">{query.isLoading ? <p className="loading-state">Chargement...</p> : rows.length === 0 ? <p className="empty-state">Aucune sous-categorie trouvee.</p> : <div className="table-wrap reference-table-wrap"><table className="data-table reference-table"><thead><tr><th>Code</th><th>Nom</th><th>Parent</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.subCategoryId}><td><strong>{row.subCategoryCode}</strong></td><td>{row.subCategoryName}</td><td>{row.categoryName ?? '-'}</td><td><ActiveBadge active={row.isActive} /></td><td><button className="ghost-button compact-button" disabled>Voir</button></td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
