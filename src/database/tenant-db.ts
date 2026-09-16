import { BadRequestException, Global, Injectable, Module } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, EntityManager } from 'typeorm';

/** Each operation gets its own transaction and connection-local tenant context. */
@Injectable()
export class TenantDb {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  run<T>(organizationId: string, operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    if (!isUUID(organizationId, '4')) throw new BadRequestException('Invalid organization id');
    return this.dataSource.transaction(async (manager) => {
      await manager.query("SELECT set_config('fintrack.organization_id', $1, true)", [organizationId]);
      return operation(manager);
    });
  }
}

@Global()
@Module({ providers: [TenantDb], exports: [TenantDb] })
export class TenantDbModule {}
