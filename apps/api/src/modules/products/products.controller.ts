import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated product catalog for household' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findAll(user, query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get restocking suggestions (placeholder)' })
  @ApiResponse({ status: 200, description: 'Array of suggestions' })
  async suggestions() {
    return this.productsService.suggestions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail with purchase history' })
  @ApiResponse({ status: 200, description: 'Product with recent purchases' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const data = await this.productsService.findOne(user, id);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product details (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Updated product' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const data = await this.productsService.update(user, id, dto);
    return { data };
  }
}
