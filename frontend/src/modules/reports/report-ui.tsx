import { ReactNode } from 'react';
import { fileDateStamp, formatDate } from '../../utils/date';
import { downloadCsv, downloadJson, downloadXlsx } from '../../utils/export';

type CellValue = string | number | boolean | null | undefined;

export type ReportColumn<T> = {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => CellValue;
};

export type ReportKpi = {
  label: string;
  value: ReactNode;
  tone?: 'success' | 'warning' | 'danger';
};

export function ReportPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="report-page">
      <header className="page-heading">
        <div>
          <span className="breadcrumb">Rapports</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export function ReportFiltersBar({ children }: { children: ReactNode }) {
  return <div className="card report-filters-bar">{children}</div>;
}

export function ReportKpiCards({ cards }: { cards: ReportKpi[] }) {
  return (
    <div className="report-kpi-grid">
      {cards.map((card) => (
        <div className={`card report-kpi-card ${card.tone ? `report-kpi-${card.tone}` : ''}`} key={card.label}>
          <span className="kpi-label">{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ReportActions<T>({
  filename,
  sheetName,
  rows,
  columns,
}: {
  filename: string;
  sheetName: string;
  rows: T[];
  columns: ReportColumn<T>[];
}) {
  const exportRows = toExportRows(rows, columns);
  const stamped = `${filename}_${fileDateStamp()}`;

  return (
    <div className="report-actions">
      <button className="secondary-button compact-button" type="button" onClick={() => window.print()}>
        Imprimer
      </button>
      <button className="secondary-button compact-button" type="button" onClick={() => downloadXlsx(`${stamped}.xlsx`, [{ name: sheetName, rows: exportRows }])}>
        Excel
      </button>
      <button className="secondary-button compact-button" type="button" onClick={() => downloadCsv(`${stamped}.csv`, exportRows)}>
        CSV
      </button>
      <button className="secondary-button compact-button" type="button" onClick={() => downloadJson(`${stamped}.json`, rows)}>
        JSON
      </button>
      <button className="secondary-button compact-button" type="button" disabled title="PDF complet prevu plus tard">
        PDF
      </button>
    </div>
  );
}

export function ReportPreview<T>({
  title,
  subtitle,
  company,
  site,
  period,
  rows,
  columns,
  totals,
  emptyText = 'Aucune donnee pour les filtres actifs.',
}: {
  title: string;
  subtitle?: string;
  company?: string;
  site?: string;
  period?: string;
  rows: T[];
  columns: ReportColumn<T>[];
  totals?: ReactNode;
  emptyText?: string;
}) {
  return (
    <section className="card report-print-area">
      <div className="report-print-header">
        <div>
          <span>{company || 'ERP Pharmaceutique SaaS'}</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="report-print-meta">
          <span>Site : {site || 'Tous les sites'}</span>
          <span>Periode : {period || 'Toutes dates'}</span>
          <span>Imprime le : {formatDate(new Date())}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : (
        <div className="table-wrap report-table-wrap">
          <table className="data-table report-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th className={column.align ? `align-${column.align}` : undefined} key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td className={column.align ? `align-${column.align}` : undefined} key={column.key}>{valueFor(row, column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totals && <div className="report-totals">{totals}</div>}
      <footer className="report-print-footer">Document genere par PharmaERP - rapport imprimable V1.1</footer>
    </section>
  );
}

function toExportRows<T>(rows: T[], columns: ReportColumn<T>[]) {
  return [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => valueFor(row, column))),
  ];
}

function valueFor<T>(row: T, column: ReportColumn<T>): CellValue {
  if (column.render) return column.render(row);
  const value = (row as Record<string, CellValue>)[column.key];
  return value ?? '';
}
