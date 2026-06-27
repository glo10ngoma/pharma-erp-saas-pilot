import { referenceService } from '../../services/reference.service';
import { SimpleCodeNamePage } from './SimpleCodeNamePage';

export function ProductTypesPage() {
  return <SimpleCodeNamePage title="Types produits" queryKey="product-types" entity="product_types" codeLabel="Code" nameLabel="Nom" codeField="typeCode" nameField="typeName" idField="productTypeId" createPermission="product_types.create" getAll={referenceService.productTypes.getAll} create={referenceService.productTypes.create} />;
}
