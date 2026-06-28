import { Injectable } from '@nestjs/common';
import { AuthUser } from '../common/types/auth-user';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const result = await this.db.query(
      `
      SELECT
        al.audit_id,
        al.action_date,
        al.user_id,
        u.full_name AS user_name,
        al.table_name,
        al.record_id,
        al.action_type,
        al.old_value,
        al.new_value,
        al.ip_address
      FROM audit_logs al
      LEFT JOIN users u ON u.user_id = al.user_id AND u.tenant_id = al.tenant_id
      WHERE al.tenant_id = $1
      ORDER BY al.action_date DESC
      LIMIT 500
      `,
      [user.tenantId],
    );

    return result.rows.map((row) => ({
      auditId: row.audit_id,
      actionDate: row.action_date,
      userId: row.user_id,
      userName: row.user_name,
      tableName: row.table_name,
      recordId: row.record_id,
      actionType: row.action_type,
      oldValue: row.old_value,
      newValue: row.new_value,
      ipAddress: row.ip_address,
    }));
  }
}
