import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all product categories' })
  @ApiResponse({ status: 200, description: 'Array of categories' })
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { data };
  }
}
