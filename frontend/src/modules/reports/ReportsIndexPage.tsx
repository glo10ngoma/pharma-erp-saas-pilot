import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const reports = [
  { title: 'Rapport Ventes', description: 'Ventes CASH et ASSURANCE, totaux, clients et statuts.', to: '/reports/sales-report', permission: 'reports.sales' },
  { title: 'Rapport Achats', description: 'Bons achats, fournisseurs, sites, montants et statuts.', to: '/reports/purchases-report', permission: 'purchases.read' },
  { title: 'Rapport Stocks', description: 'Stocks disponibles, lots, sites et seuils.', to: '/reports/stocks-report', permission: 'reports.stock' },
  { title: 'Rapport Inventaires', description: 'Inventaires, ecarts, statuts et sites.', to: '/reports/inventories-report', permission: 'inventories.read' },
  { title: 'Rapport FEFO', description: 'Lots a risque, peremptions et priorites de rotation.', to: '/reports/fefo-report', permission: 'reports.expiry' },
  { title: 'Rapport Caisse', description: 'Sessions caisse, mouvements et encaissements.', to: '/reports/cash-report', permission: 'reports.cash' },
  { title: 'Rapport Assurances', description: 'Creances assurance, paiements et soldes ouverts.', to: '/reports/insurance-report', permission: 'reports.receivables' },
  { title: 'Rapport Marges', description: 'Marges estimees par produit ou transaction.', to: '/reports/margins-report', permission: 'reports.margins' },
];

export function ReportsIndexPage() {
  const { permissions } = useAuth();
  const visibleReports = reports.filter((report) => permissions.includes(report.permission));

  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="breadcrumb">Rapports</span>
          <h1>Centre de rapports</h1>
          <p>Rapports imprimables et exportables pour les controles metier V1.</p>
        </div>
      </header>

      {visibleReports.length === 0 ? (
        <div className="card empty-state">Aucun rapport disponible pour vos permissions.</div>
      ) : (
        <div className="report-index-grid">
          {visibleReports.map((report) => (
            <article className="card report-index-card" key={report.to}>
              <div>
                <span className="badge badge-neutral">{report.permission}</span>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
              </div>
              <Link className="primary-button compact-button" to={report.to}>Ouvrir</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
