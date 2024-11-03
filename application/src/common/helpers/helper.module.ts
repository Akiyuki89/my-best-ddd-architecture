import { Module } from '@nestjs/common';
import { EncryptHelperService } from '@common/helpers/functions/encrypt.helper';

@Module({
  providers: [EncryptHelperService],
  exports: [EncryptHelperService],
})
export class HelperModule {}
