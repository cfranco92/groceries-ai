import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { ListItemsController } from './list-items.controller';
import { ListItemsService } from './list-items.service';

@Module({
  controllers: [ListsController, ListItemsController],
  providers: [ListsService, ListItemsService],
  exports: [ListsService, ListItemsService],
})
export class ListsModule {}
