import { Module } from '@nestjs/common';
import { BirthListService } from './birth-list.service';
import { BirthListController } from './birth-list.controller';

@Module({
  providers: [BirthListService],
  controllers: [BirthListController],
})
export class BirthListModule {}
