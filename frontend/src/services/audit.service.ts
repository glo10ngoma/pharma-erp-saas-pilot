import { apiClient } from './apiClient';

export type AuditLogItem = {
  auditId: string;
  actionDate: string;
  userId: string | null;
  userName: string | null;
  tableName: string;
  recordId: string | null;
  actionType: string;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
};

export const auditService = {
  getAll: () => apiClient.get<AuditLogItem[]>('/audit'),
};
