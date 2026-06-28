import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiErrorMessage } from '../../services/apiError';
import { formatDate } from '../../utils/date';
import { downloadCsv, downloadJson, downloadXlsx } from '../../utils/export';
import {
  canReadNotifications,
  GeneratedNotification,
  NotificationState,
  readNotificationState,
  useGeneratedNotifications,
  writeNotificationState,
} from './notifications-data';

type Filter = 'ALL' | 'CRITICAL' | 'STOCK' | 'FEFO' | 'POS' | 'FINANCE' | 'ADMINISTRATION' | 'SYSTEME';

export function NotificationsPage() {
  const { permissions, currentUser } = useAuth();
  const [state, setState] = useState<NotificationState>(() => readNotificationState());
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const canRead = canReadNotifications(permissions, currentUser?.role);
  const canManage = permissions.includes('notifications.manage') || currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const { notifications, loading, error } = useGeneratedNotifications(state);

  const rows = useMemo(() => filterNotifications(notifications, filter, search), [filter, notifications, search]);
  const kpis = useMemo(() => buildKpis(notifications), [notifications]);

  function update(id: string, patch: NotificationState[string]) {
    const next = { ...state, [id]: { ...state[id], ...patch } };
    setState(next);
    writeNotificationState(next);
  }

  function exportRows() {
    const data = rows.map((row) => [
      priorityLabel(row.priority),
      row.category,
      row.title,
      row.message,
      row.site,
      formatDate(row.date),
      row.status === 'READ' ? 'Lu' : 'Non lu',
      row.route,
    ]);
    return [['Priorite', 'Categorie', 'Titre', 'Message', 'Site', 'Date', 'Etat', 'Module'], ...data];
  }

  if (!canRead) {
    return <div className="card form-error">Acces refuse : permission notifications.read ou role autorise requis.</div>;
  }

  return (
    <section className="notifications-page">
      <header className="page-heading">
        <div>
          <span className="breadcrumb">Notifications</span>
          <h1>Centre de notifications</h1>
          <p>Assistant quotidien genere depuis stocks, FEFO, caisse, creances et inventaires.</p>
        </div>
        <div className="export-actions">
          <button className="ghost-button compact-button" type="button" onClick={() => downloadXlsx('notifications.xlsx', [{ name: 'Notifications', rows: exportRows() }])}>Excel</button>
          <button className="ghost-button compact-button" type="button" onClick={() => downloadCsv('notifications.csv', exportRows())}>CSV</button>
          <button className="ghost-button compact-button" type="button" onClick={() => downloadJson('notifications.json', rows)}>JSON</button>
          <button className="ghost-button compact-button" type="button" disabled>PDF</button>
        </div>
      </header>

      <section className="notification-kpi-grid">
        <Kpi label="Notifications" value={notifications.length} />
        <Kpi label="Non lues" value={kpis.unread} tone={kpis.unread > 0 ? 'warning' : 'success'} />
        <Kpi label="Critiques" value={kpis.critical} tone={kpis.critical > 0 ? 'danger' : 'success'} />
        <Kpi label="Aujourd'hui" value={kpis.today} />
        <Kpi label="Cette semaine" value={kpis.week} />
        <Kpi label="Stock faible" value={kpis.lowStock} tone={kpis.lowStock > 0 ? 'warning' : 'success'} />
        <Kpi label="Produits expires" value={kpis.expired} tone={kpis.expired > 0 ? 'danger' : 'success'} />
        <Kpi label="Creances" value={kpis.receivables} tone={kpis.receivables > 0 ? 'warning' : 'success'} />
        <Kpi label="Inventaires" value={kpis.inventories} />
        <Kpi label="Caisses ouvertes" value={kpis.openCash} />
      </section>

      <section className="card notification-filters">
        <div className="notification-filter-tabs">
          {(['ALL', 'CRITICAL', 'STOCK', 'FEFO', 'POS', 'FINANCE', 'ADMINISTRATION', 'SYSTEME'] as Filter[]).map((item) => (
            <button className={filter === item ? 'primary-button compact-button' : 'secondary-button compact-button'} key={item} type="button" onClick={() => setFilter(item)}>
              {filterLabel(item)}
            </button>
          ))}
        </div>
        <input className="input" placeholder="Rechercher categorie, message, site..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </section>

      {loading && <div className="card loading-state">Generation des notifications...</div>}
      {error && <div className="card form-error">{apiErrorMessage(error)}</div>}

      <section className="card">
        {rows.length === 0 ? (
          <p className="empty-state">Aucune notification pour les filtres actifs.</p>
        ) : (
          <div className="table-wrap notifications-table-wrap">
            <table className="data-table notifications-table">
              <thead>
                <tr>
                  <th>Priorite</th>
                  <th>Categorie</th>
                  <th>Message</th>
                  <th>Site</th>
                  <th>Date</th>
                  <th>Etat</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><span className={`notification-badge priority-${row.priority.toLowerCase()}`}>{priorityLabel(row.priority)}</span></td>
                    <td><span className="badge badge-neutral">{row.category}</span></td>
                    <td><strong>{row.title}</strong><p className="muted compact-text">{row.message}</p></td>
                    <td>{row.site}</td>
                    <td>{formatDate(row.date)}</td>
                    <td><span className={`notification-badge state-${row.status.toLowerCase()}`}>{row.status === 'READ' ? 'Lu' : 'Non lu'}</span></td>
                    <td>
                      <div className="notification-actions">
                        <Link className="table-action-button" to={row.route}>{row.routeLabel}</Link>
                        <button className="table-action-button" type="button" onClick={() => update(row.id, { read: true })}>Marquer lu</button>
                        <button className="table-action-button" type="button" onClick={() => update(row.id, { read: false })}>Non lu</button>
                        {canManage && <button className="table-action-button danger-outline" type="button" onClick={() => update(row.id, { deleted: true })}>Supprimer</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

function filterNotifications(rows: GeneratedNotification[], filter: Filter, search: string) {
  const term = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter === 'CRITICAL' && row.priority !== 'CRITICAL') return false;
    if (filter === 'STOCK' && row.category !== 'STOCK') return false;
    if (filter === 'FEFO' && row.category !== 'FEFO') return false;
    if (filter === 'POS' && !['VENTES', 'CAISSE'].includes(row.category)) return false;
    if (filter === 'FINANCE' && !['CAISSE', 'ASSURANCE'].includes(row.category)) return false;
    if (filter === 'ADMINISTRATION' && !['INVENTAIRE', 'ACHATS'].includes(row.category)) return false;
    if (filter === 'SYSTEME' && row.category !== 'SYSTEME') return false;
    if (!term) return true;
    return `${row.category} ${row.title} ${row.message} ${row.site}`.toLowerCase().includes(term);
  });
}

function buildKpis(rows: GeneratedNotification[]) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return {
    unread: rows.filter((row) => row.status === 'UNREAD').length,
    critical: rows.filter((row) => row.priority === 'CRITICAL').length,
    today: rows.filter((row) => row.date.slice(0, 10) === today).length,
    week: rows.filter((row) => new Date(row.date) >= weekAgo).length,
    lowStock: rows.filter((row) => row.id.startsWith('low-stock')).length,
    expired: rows.filter((row) => row.id.startsWith('lot-expired')).length,
    receivables: rows.filter((row) => row.category === 'ASSURANCE').length,
    inventories: rows.filter((row) => row.category === 'INVENTAIRE').length,
    openCash: rows.filter((row) => row.id.startsWith('cash-open')).length,
  };
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  return <div className={`card notification-kpi ${tone ? `notification-kpi-${tone}` : ''}`}><span>{label}</span><strong>{value}</strong></div>;
}

function filterLabel(filter: Filter) {
  if (filter === 'ALL') return 'Toutes';
  if (filter === 'CRITICAL') return 'Critiques';
  if (filter === 'POS') return 'POS';
  if (filter === 'FEFO') return 'FEFO';
  if (filter === 'SYSTEME') return 'Systeme';
  return filter.charAt(0) + filter.slice(1).toLowerCase();
}

function priorityLabel(priority: string) {
  if (priority === 'CRITICAL') return 'Critique';
  if (priority === 'WARNING') return 'Avertissement';
  return 'Information';
}
