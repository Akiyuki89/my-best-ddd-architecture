import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { EmailService } from '@infrastructure/email/email.service';

@Module({
  imports: [CommonModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
