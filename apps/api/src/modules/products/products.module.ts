import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductMatchingService } from './product-matching.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductMatchingService],
  exports: [ProductsService, ProductMatchingService],
})
export class ProductsModule {}
