import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListQueryDto } from './dto/list-query.dto';

@ApiTags('Shopping Lists')
@ApiBearerAuth()
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all shopping lists (paginated)' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListQueryDto,
  ) {
    return this.listsService.findAll(user, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new shopping list' })
  @ApiResponse({ status: 201, description: 'List created' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateListDto,
  ) {
    const data = await this.listsService.create(user, dto);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shopping list with items' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const data = await this.listsService.findOne(user, id);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shopping list' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateListDto,
  ) {
    const data = await this.listsService.update(user, id, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a shopping list' })
  @ApiResponse({ status: 204, description: 'List deleted' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    await this.listsService.remove(user, id);
  }
}
