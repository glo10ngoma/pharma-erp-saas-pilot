import { ReactNode } from 'react';
import { fileDateStamp } from '../../utils/date';
import { downloadCsv, downloadJson, downloadXlsx } from '../../utils/export';

type Cell = string | number | boolean | null | undefined;

export function ReferenceExportActions({
  baseName,
  disabled,
  jsonData,
  rows,
  sheetName,
}: {
  baseName: string;
  disabled?: boolean;
  jsonData: unknown;
  rows: Cell[][];
  sheetName: string;
}) {
  const stamp = fileDateStamp();
  return (
    <div className="export-actions reference-export-actions">
      <button className="ghost-button compact-button" type="button" disabled={disabled} onClick={() => downloadXlsx(`${baseName}_${stamp}.xlsx`, [{ name: sheetName, rows }])}>Excel</button>
      <button className="ghost-button compact-button" type="button" disabled={disabled} onClick={() => downloadCsv(`${baseName}_${stamp}.csv`, rows)}>CSV</button>
      <button className="ghost-button compact-button" type="button" disabled={disabled} onClick={() => downloadJson(`${baseName}_${stamp}.json`, jsonData)}>JSON</button>
      <button className="ghost-button compact-button" type="button" disabled title="PDF non pret">PDF</button>
    </div>
  );
}

export function ActiveBadge({ active }: { active?: boolean | null }) {
  return <span className={`badge ${active ? 'badge-success' : 'badge-muted'}`}>{active ? 'Actif' : 'Inactif'}</span>;
}

export function ReferenceHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="page-heading reference-heading">
      <div>
        <h1>{title}</h1>
        <p className="muted">Donnees de base - recherche, export et saisie rapide.</p>
      </div>
      {children}
    </div>
  );
}

export function ReferenceSummary({
  active,
  filtered,
  inactive,
  total,
}: {
  active?: number;
  filtered?: number;
  inactive?: number;
  total: number;
}) {
  return (
    <div className="reference-summary-grid">
      <div className="card kpi-card reference-summary-card"><span className="kpi-label">Total</span><p className="metric small-metric">{total}</p></div>
      <div className="card kpi-card reference-summary-card"><span className="kpi-label">Actifs</span><p className="metric small-metric">{active ?? total}</p></div>
      <div className="card kpi-card reference-summary-card"><span className="kpi-label">Inactifs</span><p className="metric small-metric">{inactive ?? 0}</p></div>
      <div className="card kpi-card reference-summary-card"><span className="kpi-label">Filtres</span><p className="metric small-metric">{filtered ?? total}</p></div>
    </div>
  );
}

export function summarizeActive<T extends { isActive?: boolean }>(rows: T[]) {
  const active = rows.filter((row) => row.isActive !== false).length;
  return { active, inactive: rows.length - active };
}

export function refText(value: unknown) {
  return String(value ?? '').toLowerCase();
}
