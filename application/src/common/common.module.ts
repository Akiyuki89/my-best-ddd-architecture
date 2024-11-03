import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from '@common/configuration/env/dotenv.config';
import { HelperModule } from '@common/helpers/helper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HelperModule,
  ],
  providers: [EnvService],
  exports: [EnvService, HelperModule],
})
export class CommonModule {}
