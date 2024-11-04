import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { DomainModule } from '@domain/domain.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [CommonModule, DomainModule, InfrastructureModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApplicationModule {}
