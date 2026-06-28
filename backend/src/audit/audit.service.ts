import { Injectable } from '@nestjs/common';
import { AuthUser } from '../common/types/auth-user';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  findAll(user: AuthUser) {
    return this.repository.findAll(user);
  }
}
