import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { AdminExportActions, AdminSummary } from './admin-ui';

const ENTITIES = [
  ['articles', 'Articles'],
  ['customers', 'Clients'],
  ['suppliers', 'Fournisseurs'],
  ['purchases', 'Achats'],
  ['sales', 'Ventes'],
  ['inventories', 'Inventaires'],
  ['transfers', 'Transferts'],
  ['users', 'Utilisateurs'],
] as const;

export function NumberingPage() {
  const queries = useQueries({
    queries: ENTITIES.map(([entity]) => ({
      queryKey: ['next-code', 'admin', entity],
      queryFn: async () => (await codeGeneratorService.next(entity)).data,
    })),
  });
  const rows = ENTITIES.map(([entity, label], index) => ({
    entity,
    label,
    nextCode: queries[index].data?.code ?? '-',
    status: queries[index].isError ? 'Indisponible' : queries[index].isLoading ? 'Chargement' : 'OK',
  }));
  const exportRows = useMemo(() => [['Entite', 'Libelle', 'Prochain code', 'Statut'], ...rows.map((row) => [row.entity, row.label, row.nextCode, row.status])], [rows]);
  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Numerotation</h1><p className="muted">Vue lecture seule des prochains codes proposes.</p></div>
        <AdminExportActions baseName="numerotation" sheetName="Numerotation" rows={exportRows} jsonData={rows} />
      </div>
      <AdminSummary cards={[{ label: 'Entites', value: rows.length }, { label: 'Disponibles', value: rows.filter((row) => row.status === 'OK').length }, { label: 'Lecture seule', value: 'V1' }]} />
      <div className="card table-card">
        <div className="table-wrap admin-table-wrap">
          <table className="data-table reference-table admin-table">
            <thead><tr><th>Entite</th><th>Prochain code</th><th>Statut</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.entity}><td><strong>{row.label}</strong><small>{row.entity}</small></td><td>{row.nextCode}</td><td><span className={`badge ${row.status === 'OK' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
