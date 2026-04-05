import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { OcrService } from './ocr.service';

@Module({
  imports: [ProductsModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, OcrService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
