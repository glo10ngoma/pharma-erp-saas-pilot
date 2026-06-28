import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { sitesService } from '../../services/sites.service';

export function CompanySettingsPage() {
  const { currentUser } = useAuth();
  const sites = useQuery({ queryKey: ['sites', 'company'], queryFn: async () => (await sitesService.getAll()).data });
  const mainSite = sites.data?.[0];
  return (
    <>
      <div className="page-heading reference-heading">
        <div><h1>Entreprise</h1><p className="muted">Configuration entreprise V1 en lecture seule.</p></div>
      </div>
      <div className="card detail-grid">
        <div><span>Tenant</span><strong>{currentUser?.tenantId ?? '-'}</strong></div>
        <div><span>Nom pharmacie</span><strong>{mainSite?.siteName ?? 'Pharmacie'}</strong></div>
        <div><span>Adresse</span><strong>{mainSite?.address ?? '-'}</strong></div>
        <div><span>Telephone</span><strong>{mainSite?.phone ?? '-'}</strong></div>
        <div><span>Email</span><strong>-</strong></div>
        <div><span>RCCM / ID NAT / NIF</span><strong>A renseigner en V2</strong></div>
      </div>
    </>
  );
}
