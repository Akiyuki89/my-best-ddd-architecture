import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { CommonModule } from '@common/common.module';
import { DomainModule } from '@domain/domain.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [ApplicationModule, CommonModule, DomainModule, InfrastructureModule],
})
export class AppModule {}
