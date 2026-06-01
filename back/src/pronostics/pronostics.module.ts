import { Module } from '@nestjs/common';
import { PronosticsService } from './pronostics.service';
import { PronosticsController } from './pronostics.controller';

@Module({
  providers: [PronosticsService],
  controllers: [PronosticsController],
})
export class PronosticsModule {}
