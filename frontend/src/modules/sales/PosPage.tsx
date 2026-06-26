import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingSearchPopover } from '../../components/FloatingSearchPopover';
import { Article, articlesService } from '../../services/articles.service';
import { apiErrorMessage } from '../../services/apiError';
import { cashService } from '../../services/cash.service';
import { insuranceService } from '../../services/insurance.service';
import { referenceService } from '../../services/reference.service';
import { salesService } from '../../services/sales.service';
import { sitesService } from '../../services/sites.service';
import { stocksService } from '../../services/stocks.service';
import { formatDate } from '../../utils/date';
import { formatMoney } from '../../utils/money';

type PosForm = {
  siteId: string;
  saleType: 'CASH' | 'INSURANCE';
  customerId: string;
  exchangeRate: string;
  membershipId: string;
};

const initialForm = (): PosForm => ({ siteId: '', saleType: 'CASH', customerId: '', exchangeRate: '1', membershipId: '' });

export function PosPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<PosForm>(initialForm);
  const [sale, setSale] = useState<any>(null);
  const [articleQuery, setArticleQuery] = useState('');
  const [articlePopoverOpen, setArticlePopoverOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [amountPaid, setAmountPaid] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [clientError, setClientError] = useState('');

  const sites = useQuery({ queryKey: ['sites'], queryFn: async () => (await sitesService.getAll()).data });
  const articles = useQuery({ queryKey: ['articles', 'pos'], queryFn: async () => (await articlesService.getAll({ limit: 1000 })).data.items });
  const stocks = useQuery({ queryKey: ['stocks', 'pos'], queryFn: async () => (await stocksService.getAll()).data });
  const customers = useQuery({ queryKey: ['customers'], queryFn: async () => (await referenceService.customers.getAll()).data });
  const memberships = useQuery({ queryKey: ['customer-memberships', form.customerId], queryFn: async () => (await insuranceService.memberships.getByCustomer(form.customerId)).data, enabled: Boolean(form.customerId) });
  const currentCashSession = useQuery({ queryKey: ['cash-current', form.siteId], queryFn: async () => (await cashService.getCurrentSession(form.siteId)).data, enabled: Boolean(form.siteId) });

  const stockByArticle = useMemo(() => {
    const map = new Map<string, number>();
    for (const stock of stocks.data ?? []) {
      if (form.siteId && stock.siteId !== form.siteId) continue;
      map.set(stock.articleId, (map.get(stock.articleId) ?? 0) + Number(stock.quantityAvailable ?? 0));
    }
    return map;
  }, [form.siteId, stocks.data]);
  const fefoByArticle = useMemo(() => {
    const map = new Map<string, { lot: string; expiry: string }>();
    const rows = [...(stocks.data ?? [])]
      .filter((stock) => (!form.siteId || stock.siteId === form.siteId) && Number(stock.quantityAvailable) > 0)
      .sort((a, b) => String(a.expiryDate).localeCompare(String(b.expiryDate)));
    for (const stock of rows) if (!map.has(stock.articleId)) map.set(stock.articleId, { lot: stock.lotNumber, expiry: stock.expiryDate });
    return map;
  }, [form.siteId, stocks.data]);
  const articleSuggestions = useMemo(() => {
    const query = articleQuery.trim().toLowerCase();
    const source = articles.data ?? [];
    if (!query) return source.slice(0, 80);
    return prioritizeExactBarcode(source.filter((article) => [article.articleCode, article.commercialName, article.dci, article.dosage, article.barcode].some((value) => String(value ?? '').toLowerCase().includes(query))), articleQuery);
  }, [articleQuery, articles.data]);
  const items = sale?.items ?? [];
  const payments = sale?.payments ?? [];
  const currencyCode = sale?.currencyCode ?? 'USD';
  const currencySymbol = sale?.currencySymbol;
  const subtotal = Number(sale?.subtotal ?? sale?.totalAmount ?? 0);
  const discount = Number(sale?.discountAmount ?? 0);
  const total = Number(sale?.totalAmount ?? 0);
  const patientPayable = Number(sale?.customerPayableAmount ?? total);
  const insuranceAmount = Number(sale?.insuranceCoveredAmount ?? 0);
  const paid = Number(amountPaid || 0);
  const changeDue = Math.max(0, paid - patientPayable);
  const quantityTotal = items.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0);

  const createDraft = useMutation({
    mutationFn: async () => (await salesService.create({ siteId: form.siteId, saleType: form.saleType, customerId: form.customerId || undefined, exchangeRate: Number(form.exchangeRate || 1) })).data,
    onSuccess: (created) => {
      setSale(created);
      setAmountPaid(String(created.customerPayableAmount ?? created.totalAmount ?? 0));
      setTimeout(() => focusArticleSearch(), 0);
    },
  });
  const addItem = useMutation({
    mutationFn: (articleId: string) => salesService.addItemFefo(sale.saleId, { articleId, quantity: Number(quantity || 1) }),
    onSuccess: (response) => {
      setSale(response.data);
      setAmountPaid(String(response.data.customerPayableAmount ?? response.data.totalAmount ?? 0));
      setArticleQuery('');
      setQuantity('1');
      setClientError('');
      setTimeout(() => focusArticleSearch(), 0);
    },
  });
  const removeItem = useMutation({
    mutationFn: (itemId: string) => salesService.removeItem(sale.saleId, itemId),
    onSuccess: (response) => {
      setSale(response.data);
      setAmountPaid(String(response.data.customerPayableAmount ?? response.data.totalAmount ?? 0));
    },
  });
  const applyInsurance = useMutation({
    mutationFn: () => salesService.applyInsurance(sale.saleId, { membershipId: form.membershipId }),
    onSuccess: (response) => {
      setSale(response.data);
      setAmountPaid(String(response.data.customerPayableAmount));
    },
  });
  const validate = useMutation({
    mutationFn: () => salesService.validate(sale.saleId, { amountPaid: Number(amountPaid || 0) }),
    onSuccess: async (response) => {
      await qc.invalidateQueries({ queryKey: ['sales'] });
      await qc.invalidateQueries({ queryKey: ['stocks'] });
      navigate(`/sales/${response.data.saleId}`);
    },
  });
  const cancel = useMutation({ mutationFn: () => salesService.cancel(sale.saleId), onSuccess: () => navigate('/sales') });

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'F2') { event.preventDefault(); focusArticleSearch(); setArticlePopoverOpen(true); }
      if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); if (canValidate()) validate.mutate(); }
      if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); focusArticleSearch(); setArticlePopoverOpen(true); }
      if (event.ctrlKey && event.key === 'Delete' && selectedLineId) { event.preventDefault(); removeItem.mutate(selectedLineId); }
      if (event.key === 'Escape') navigate('/sales');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function update<K extends keyof PosForm>(key: K, value: PosForm[K]) {
    setForm((current) => ({ ...current, [key]: value, ...(key === 'saleType' && value === 'CASH' ? { membershipId: '' } : {}) }));
  }
  function focusArticleSearch() {
    document.querySelector<HTMLInputElement>('.pos-article-input')?.focus();
  }
  function startSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.saleType === 'INSURANCE' && !form.customerId) { setClientError('Un client est obligatoire pour une vente assurance.'); return; }
    setClientError('');
    createDraft.mutate();
  }
  function selectArticle(article: Article) {
    if (!sale?.saleId) { setClientError('Creez d abord une vente DRAFT.'); return; }
    addItem.mutate(article.articleId);
  }
  function handleArticleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter') {
      const exact = articleSuggestions.find((article) => [article.articleCode, article.barcode].some((value) => String(value ?? '').toLowerCase() === articleQuery.trim().toLowerCase()));
      if (exact) { event.preventDefault(); selectArticle(exact); }
    }
  }
  function canValidate() {
    return Boolean(sale?.saleId && sale.status === 'DRAFT' && items.length > 0 && !validate.isPending && paid >= patientPayable);
  }
  function printDraft() {
    window.print();
  }

  const error = clientError || apiErrorMessage(createDraft.error || addItem.error || removeItem.error || applyInsurance.error || validate.error || cancel.error);
  const showError = clientError || createDraft.isError || addItem.isError || removeItem.isError || applyInsurance.isError || validate.isError || cancel.isError;

  return (
    <div className="pos-page purchase-erp-window">
      <div className="breadcrumb"><Link to="/sales">Ventes</Link><span>&gt;</span><strong>POS</strong></div>
      <div className="toolbar pos-toolbar">
        <div>
          <h1>POS</h1>
          <p className="muted">Vente rapide FEFO, paiement comptoir et prise en charge assurance.</p>
        </div>
        <div className="pos-cash-status">
          <span className={`badge ${currentCashSession.data ? 'badge-success' : 'badge-warning'}`}>{currentCashSession.data ? 'Caisse ouverte' : 'Caisse non ouverte'}</span>
          <small>{currentCashSession.data ? `${currentCashSession.data.registerName ?? 'Caisse'} - Ouverture ${formatMoney(currentCashSession.data.openingBalance, currencyCode, currencySymbol)}` : 'Validation CASH possible selon regle backend, mouvement caisse cree si session ouverte.'}</small>
        </div>
      </div>
      {showError && <p className="form-error">{error}</p>}

      <form className="card compact-card pos-header-grid" onSubmit={startSale}>
        <label><span>Vente n°</span><input className="input compact-input" value={sale?.saleNumber ?? 'Auto'} disabled /></label>
        <label><span>Client</span><select className="input compact-input" value={form.customerId} disabled={Boolean(sale)} onChange={(event) => update('customerId', event.target.value)} required={form.saleType === 'INSURANCE'}><option value="">Client comptoir</option>{(customers.data ?? []).map((customer) => <option key={customer.customerId} value={customer.customerId}>{customer.customerName}</option>)}</select></label>
        <label><span>Type</span><select className="input compact-input" value={form.saleType} disabled={Boolean(sale)} onChange={(event) => update('saleType', event.target.value as PosForm['saleType'])}><option value="CASH">CASH</option><option value="INSURANCE">INSURANCE</option></select></label>
        <label><span>Assurance</span><select className="input compact-input" value={form.membershipId} disabled={form.saleType !== 'INSURANCE' || !sale || sale.status !== 'DRAFT'} onChange={(event) => update('membershipId', event.target.value)}><option value="">Membership / Plan</option>{(memberships.data ?? []).filter((membership) => membership.isActive).map((membership) => <option key={membership.membershipId} value={membership.membershipId}>{membership.organizationName} - {membership.planName} ({membership.coveragePercent}%)</option>)}</select></label>
        <label><span>Site</span><select className="input compact-input" value={form.siteId} disabled={Boolean(sale)} onChange={(event) => update('siteId', event.target.value)} required><option value="">Site</option>{(sites.data ?? []).map((site) => <option key={site.siteId} value={site.siteId}>{site.siteName}</option>)}</select></label>
        <label><span>Devise</span><input className="input compact-input" value="USD" disabled /></label>
        <label><span>Taux</span><input className="input compact-input" type="number" value={form.exchangeRate} disabled={Boolean(sale)} min="1" step="0.0001" onChange={(event) => update('exchangeRate', event.target.value)} /></label>
        {!sale ? <button className="button compact-button" disabled={createDraft.isPending || sites.isLoading}>{createDraft.isPending ? 'Ouverture...' : 'Créer vente'}</button> : <span className={`badge ${sale.status === 'VALIDATED' ? 'badge-success' : 'badge-warning'}`}>{sale.status}</span>}
      </form>

      <section className="card compact-card pos-workspace">
        <div className="pos-search-row">
          <FloatingSearchPopover
            columns={[
              { header: 'Code', render: (article) => article.articleCode },
              { header: 'Barcode', render: (article) => article.barcode ?? '-' },
              { header: 'Nom', render: (article) => <strong>{article.commercialName}</strong> },
              { header: 'DCI', render: (article) => article.dci ?? '-' },
              { header: 'Dosage', render: (article) => article.dosage ?? '-' },
              { header: 'Stock', render: (article) => stockByArticle.get(article.articleId) ?? article.stockAvailable ?? 0 },
              { header: 'Prix vente', render: (article) => formatMoney(article.sellingPrice ?? 0, currencyCode, currencySymbol) },
              { header: 'Lot FEFO', render: (article) => fefoByArticle.get(article.articleId)?.lot ?? '-' },
            ]}
            getKey={(article) => article.articleId}
            inputClassName="input pos-article-input"
            onChange={setArticleQuery}
            onClose={() => setArticlePopoverOpen(false)}
            onFallbackKeyDown={handleArticleKeys}
            onOpen={() => setArticlePopoverOpen(true)}
            onSelect={selectArticle}
            open={articlePopoverOpen}
            placeholder="Scanner code-barres ou rechercher article..."
            searchPlaceholder="Rechercher (code, nom, DCI, dosage, barcode...)"
            suggestions={articleSuggestions}
            value={articleQuery}
          />
          <input className="input compact-input pos-qty-input" type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          {form.saleType === 'INSURANCE' && <button className="ghost-button compact-button" type="button" disabled={!form.membershipId || items.length === 0 || applyInsurance.isPending || sale?.status !== 'DRAFT'} onClick={() => applyInsurance.mutate()}>{applyInsurance.isPending ? 'Application...' : 'Appliquer assurance'}</button>}
        </div>

        <div className="table-wrap pos-grid-wrap">
          <table className="data-table pos-lines-table">
            <thead><tr><th>Article</th><th>Lot FEFO</th><th>Expiration</th><th>Qté</th><th>Prix</th><th>Remise</th><th>Total</th><th>Actions</th></tr></thead>
            <tbody>{items.length === 0 ? <tr><td colSpan={8}><p className="empty-state">Aucun article. Utilisez F2, scannez ou recherchez un produit.</p></td></tr> : items.map((item: any) => (
              <tr className={selectedLineId === item.saleItemId ? 'selected-row' : ''} key={item.saleItemId} onClick={() => setSelectedLineId(item.saleItemId)}>
                <td><strong>{item.commercialName}</strong><small>{item.articleCode ?? ''}</small></td>
                <td>{item.lotNumber ?? '-'}</td>
                <td>{item.expiryDate ? formatDate(item.expiryDate) : '-'}</td>
                <td className="quantity-cell">{item.quantity}</td>
                <td className="numeric-text">{formatMoney(item.unitPrice, currencyCode, currencySymbol)}</td>
                <td className="numeric-text">{formatMoney(0, currencyCode, currencySymbol)}</td>
                <td className="numeric-text"><strong>{formatMoney(item.lineTotal, currencyCode, currencySymbol)}</strong></td>
                <td><button aria-label="Supprimer ligne" className="ghost-button compact-button row-action-button icon-only danger" type="button" disabled={sale?.status !== 'DRAFT' || removeItem.isPending} onClick={(event) => { event.stopPropagation(); removeItem.mutate(item.saleItemId); }}><TrashIcon /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <p className="muted pos-scan-help">Scanner un code-barres ou taper un nom/code/DCI.</p>

      <section className="card compact-card pos-summary-panel">
        <div className="pos-summary-grid">
          <Summary label="Articles" value={String(items.length)} />
          <Summary label="Qté totale" value={String(quantityTotal)} />
          <Summary label="Sous-total" value={formatMoney(subtotal, currencyCode, currencySymbol)} />
          <Summary label="Remise" value={formatMoney(discount, currencyCode, currencySymbol)} />
          <Summary label="Total" value={formatMoney(total, currencyCode, currencySymbol)} strong />
          <Summary label="Part assurance" value={formatMoney(insuranceAmount, currencyCode, currencySymbol)} />
          <Summary label="Part patient" value={formatMoney(patientPayable, currencyCode, currencySymbol)} strong />
          <label className="pos-paid-field"><span>Payé</span><input className="input compact-input numeric-cell" type="number" min="0" step="0.01" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} /></label>
          <Summary label="Monnaie" value={formatMoney(changeDue, currencyCode, currencySymbol)} strong />
        </div>
        <div className="page-actions">
          <button className="ghost-button compact-button" type="button" disabled={!sale || sale.status !== 'DRAFT'} onClick={() => cancel.mutate()}>Annuler vente</button>
          <button className="ghost-button compact-button" type="button" disabled={!sale} onClick={printDraft}>Imprimer facture</button>
          <button className="button compact-button" type="button" disabled={!canValidate()} onClick={() => validate.mutate()}>{validate.isPending ? 'Encaissement...' : 'Valider / Encaisser'}</button>
        </div>
      </section>

      <div className="print-invoice">
        <h1>PharmaERP</h1>
        <p>Facture {sale?.saleNumber ?? '-'}</p>
        <p>Date: {sale?.saleDate ? formatDate(sale.saleDate) : '-'}</p>
        <p>Client: {(customers.data ?? []).find((customer) => customer.customerId === form.customerId)?.customerName ?? 'Comptoir'}</p>
        <table><tbody>{items.map((item: any) => <tr key={item.saleItemId}><td>{item.commercialName}</td><td>{item.quantity}</td><td>{formatMoney(item.lineTotal, currencyCode, currencySymbol)}</td></tr>)}</tbody></table>
        <h2>Total: {formatMoney(total, currencyCode, currencySymbol)}</h2>
        <p>Payé: {formatMoney(paid, currencyCode, currencySymbol)}</p>
        <p>Merci pour votre confiance.</p>
      </div>
    </div>
  );
}

function TrashIcon() {
  return <svg aria-hidden="true" className="row-action-icon" focusable="false" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M9 10v8M15 10v8M6 6l1 14h10l1-14" /></svg>;
}

function prioritizeExactBarcode(articles: Article[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return articles;
  return [...articles].sort((a, b) => Number(String(b.barcode ?? '').toLowerCase() === needle) - Number(String(a.barcode ?? '').toLowerCase() === needle));
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="form-summary pos-summary-item"><span>{label}</span><strong className={strong ? 'pos-total-text' : ''}>{value}</strong></div>;
}
