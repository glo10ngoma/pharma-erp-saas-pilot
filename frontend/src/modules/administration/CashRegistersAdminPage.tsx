import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBox } from '../../components/SearchBox';
import { filterRows } from '../../lib/search';
import { cashService } from '../../services/cash.service';
import { formatDate } from '../../utils/date';
import { formatMoney } from '../../utils/money';
import { AdminExportActions, AdminSummary } from './admin-ui';

export function CashRegistersAdminPage() {
  const [search, setSearch] = useState('');
  const sessions = useQuery({ queryKey: ['cash-sessions', 'admin'], queryFn: async () => (await cashService.getSessions()).data });
  const rows = filterRows(sessions.data ?? [], search, (row) => [row.registerName, row.siteName, row.userName, row.status]);
  const open = rows.filter((row) => row.status === 'OPEN').length;
  const exportRows = useMemo(() => [
    ['Caisse', 'Site', 'Utilisateur', 'Ouverture', 'Fermeture', 'Solde ouverture', 'Solde attendu', 'Ecart', 'Statut'],
    ...rows.map((row) => [
      row.registerName ?? '-',
      row.siteName ?? '-',
      row.userName ?? '-',
      formatDate(row.openedAt),
      row.closedAt ? formatDate(row.closedAt) : '-',
      row.openingBalance,
      row.expectedClosingBalance,
      row.differenceAmount,
      row.status,
    ]),
  ], [rows]);

  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Caisses</h1><p className="muted">Sessions caisse et statut operationnel.</p></div>
        <AdminExportActions baseName="caisses" sheetName="Caisses" rows={exportRows} jsonData={rows} disabled={rows.length === 0} />
      </div>
      <AdminSummary cards={[{ label: 'Sessions', value: rows.length }, { label: 'Ouvertes', value: open }, { label: 'Fermees', value: rows.length - open }, { label: 'Filtrees', value: rows.length }]} />
      <div className="card reference-filters"><SearchBox value={search} onChange={setSearch} placeholder="Rechercher caisse, site, utilisateur, statut..." /></div>
      <div className="card table-card">
        {sessions.isLoading ? <p className="loading-state">Chargement des caisses...</p> : rows.length === 0 ? <p className="empty-state">Aucune session caisse trouvee.</p> : (
          <div className="table-wrap admin-table-wrap">
            <table className="data-table reference-table admin-table">
              <thead><tr><th>Caisse</th><th>Site</th><th>Utilisateur</th><th>Ouverture</th><th>Solde</th><th>Ecart</th><th>Statut</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.cashSessionId}><td>{row.registerName ?? '-'}</td><td>{row.siteName ?? '-'}</td><td>{row.userName ?? '-'}</td><td>{formatDate(row.openedAt)}</td><td className="numeric-text">{formatMoney(row.expectedClosingBalance, 'USD')}</td><td className="numeric-text">{formatMoney(row.differenceAmount, 'USD')}</td><td><span className={`badge ${row.status === 'OPEN' ? 'badge-success' : 'badge-muted'}`}>{row.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
