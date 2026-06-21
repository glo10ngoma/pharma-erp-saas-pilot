import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';

export function DashboardLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const groups = [
    {
      title: 'Pilotage',
      links: [
        ['/dashboard', 'Dashboard'],
        ['/reports', 'Reporting BI'],
        ['/profile', 'Mon profil'],
      ],
    },
    {
      title: 'Pharmacie',
      links: [
        ['/articles', 'Articles'],
        ['/categories', 'Categories'],
        ['/sub-categories', 'Sous-categories'],
        ['/galenic-forms', 'Formes galeniques'],
        ['/administration-routes', 'Voies administration'],
        ['/product-types', 'Types produits'],
        ['/suppliers', 'Fournisseurs'],
        ['/customers', 'Clients'],
      ],
    },
    {
      title: 'Operations',
      links: [
        ['/purchases', 'Achats'],
        ['/lots', 'Lots'],
        ['/stocks', 'Stocks'],
        ['/sales', 'Ventes'],
        ['/pos', 'POS'],
        ['/cash', 'Caisse'],
        ['/inventories', 'Inventaires'],
      ],
    },
    {
      title: 'Tiers',
      links: [
        ['/organizations', 'Organisations'],
        ['/insurance-plans', 'Plans assurance'],
        ['/memberships', 'Affiliations'],
        ['/receivables', 'Creances'],
      ],
    },
    {
      title: 'Finance & admin',
      links: [
        ['/accounting/accounts', 'Plan comptable'],
        ['/accounting/journals', 'Journaux'],
        ['/accounting/entries', 'Ecritures'],
        ['/accounting/general-ledger', 'Grand livre'],
        ['/accounting/trial-balance', 'Balance'],
        ['/users', 'Users'],
        ['/roles', 'Roles'],
        ['/permissions', 'Permissions'],
        ['/sites', 'Sites'],
      ],
    },
  ];

  if (!token) return <Navigate to="/login" replace />;

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>PharmaERP</h2>
          <span>SaaS pharmacie V1</span>
        </div>
        <nav>
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.links.map(([to, label]) => (
                <Link className="nav-link" key={to} to={to}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <button className="ghost-button" onClick={logout}>
          Deconnexion
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
