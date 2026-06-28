import { fileDateStamp } from '../../utils/date';
import { downloadCsv, downloadJson, downloadXlsx } from '../../utils/export';

type Cell = string | number | boolean | null | undefined;

export function AdminSummary({ cards }: { cards: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="reference-summary-grid admin-summary-grid">
      {cards.map((card) => (
        <div className="card kpi-card reference-summary-card" key={card.label}>
          <span className="kpi-label">{card.label}</span>
          <p className="metric small-metric">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminExportActions({
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
    <div className="export-actions admin-export-actions">
      <button className="ghost-button compact-button" disabled={disabled} type="button" onClick={() => downloadXlsx(`${baseName}_${stamp}.xlsx`, [{ name: sheetName, rows }])}>Excel</button>
      <button className="ghost-button compact-button" disabled={disabled} type="button" onClick={() => downloadCsv(`${baseName}_${stamp}.csv`, rows)}>CSV</button>
      <button className="ghost-button compact-button" disabled={disabled} type="button" onClick={() => downloadJson(`${baseName}_${stamp}.json`, jsonData)}>JSON</button>
    </div>
  );
}
