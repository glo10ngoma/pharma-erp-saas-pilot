import { referenceService } from '../../services/reference.service';
import { SimpleCodeNamePage } from './SimpleCodeNamePage';

export function AdministrationRoutesPage() {
  return <SimpleCodeNamePage title="Voies administration" queryKey="administration-routes" entity="administration_routes" codeLabel="Code" nameLabel="Nom" codeField="routeCode" nameField="routeName" idField="routeId" createPermission="administration_routes.create" getAll={referenceService.administrationRoutes.getAll} create={referenceService.administrationRoutes.create} />;
}
