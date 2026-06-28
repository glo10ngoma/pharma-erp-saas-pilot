import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { filterRows } from '../../lib/search';
import { AuditLogItem, auditService } from '../../services/audit.service';
import { formatDate } from '../../utils/date';
import { AdminExportActions, AdminSummary } from './admin-ui';

export function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [detail, setDetail] = useState<AuditLogItem | null>(null);
  const query = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await auditService.getAll()).data });
  const rows = filterRows(query.data ?? [], search, (row) => [row.userName, row.tableName, row.actionType, row.recordId]).filter((row) => !action || row.actionType === action);
  const actions = Array.from(new Set((query.data ?? []).map((row) => row.actionType))).sort();
  const exportRows = useMemo(() => [['Date', 'Utilisateur', 'Module', 'Action', 'Record', 'IP'], ...rows.map((row) => [formatDate(row.actionDate), row.userName ?? '-', row.tableName, row.actionType, row.recordId ?? '-', row.ipAddress ?? '-'])], [rows]);
  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Journaux d'audit</h1><p className="muted">Lecture seule des actions sensibles du tenant.</p></div>
        <AdminExportActions baseName="audit_logs" sheetName="Audit" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />
      </div>
      <AdminSummary cards={[{ label: 'Total', value: query.data?.length ?? 0 }, { label: 'Filtres', value: rows.length }, { label: 'Actions', value: actions.length }]} />
      <div className="card reference-filters admin-filter-row">
        <SearchBox value={search} onChange={setSearch} placeholder="Rechercher utilisateur, module, action..." />
        <select className="input compact-input" value={action} onChange={(event) => setAction(event.target.value)}><option value="">Toutes actions</option>{actions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      <div className="card table-card">
        {query.isLoading ? <p className="loading-state">Chargement audit...</p> : rows.length === 0 ? <p className="empty-state">Aucun journal trouve.</p> : (
          <div className="table-wrap admin-table-wrap">
            <table className="data-table reference-table admin-table">
              <thead><tr><th>Date</th><th>Utilisateur</th><th>Module</th><th>Action</th><th>Record</th><th>Actions</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.auditId}><td>{formatDate(row.actionDate)}</td><td>{row.userName ?? '-'}</td><td>{row.tableName}</td><td><span className="badge badge-muted">{row.actionType}</span></td><td>{row.recordId ?? '-'}</td><td><button className="ghost-button compact-button admin-view-button" onClick={() => setDetail(row)}>Voir</button></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      <Modal title="Detail audit" open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && <pre className="admin-json-preview">{JSON.stringify(detail, null, 2)}</pre>}
      </Modal>
    </>
  );
}
