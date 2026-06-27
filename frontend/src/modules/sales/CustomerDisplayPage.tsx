import { useEffect, useState } from 'react';
import { formatMoney } from '../../utils/money';

type CustomerDisplayItem = {
  name: string;
  quantity: number;
  totalFc: number;
};

type CustomerDisplaySnapshot = {
  items: CustomerDisplayItem[];
  totalFc: number;
  message: string;
};

const emptySnapshot: CustomerDisplaySnapshot = {
  items: [],
  totalFc: 0,
  message: 'Merci pour votre confiance.',
};

export function CustomerDisplayPage() {
  const [snapshot, setSnapshot] = useState<CustomerDisplaySnapshot>(() => readSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => setSnapshot(readSnapshot()), 600);
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'posCustomerDisplay') setSnapshot(readSnapshot());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <main className="customer-display-page">
      <section className="customer-display-ticket">
        <header>
          <span>PharmaERP</span>
          <strong>Total</strong>
        </header>
        <div className="customer-display-total">{formatMoney(snapshot.totalFc, 'CDF')}</div>
        <div className="customer-display-lines">
          {snapshot.items.length === 0 ? (
            <p className="empty-state">En attente du prochain article.</p>
          ) : snapshot.items.map((item, index) => (
            <div className="customer-display-line" key={`${item.name}-${index}`}>
              <div>
                <strong>{item.name}</strong>
                <span>Qte {item.quantity}</span>
              </div>
              <b>{formatMoney(item.totalFc, 'CDF')}</b>
            </div>
          ))}
        </div>
        <footer>{snapshot.message}</footer>
      </section>
    </main>
  );
}

function readSnapshot(): CustomerDisplaySnapshot {
  try {
    const raw = localStorage.getItem('posCustomerDisplay');
    if (!raw) return emptySnapshot;
    return { ...emptySnapshot, ...JSON.parse(raw) };
  } catch {
    return emptySnapshot;
  }
}
