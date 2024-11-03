import { ApiTags } from '@nestjs/swagger';
import { Controller, Dependencies, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
@Dependencies(HealthCheckService, HttpHealthIndicator)
export class HealthController {
  constructor(
    private health: { check: (arg0: (() => any)[]) => any },
    private http: { pingCheck: (arg0: string, arg1: string) => any },
  ) {}

  @Get()
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return this.health.check([() => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com')]);
  }
}
