import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { ListItemsService } from './list-items.service';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';

@ApiTags('List Items')
@ApiBearerAuth()
@Controller('lists/:listId/items')
export class ListItemsController {
  constructor(private readonly listItemsService: ListItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Add an item to a shopping list' })
  @ApiResponse({ status: 201, description: 'Item added' })
  async addItem(
    @CurrentUser() user: AuthUser,
    @Param('listId') listId: string,
    @Body() dto: CreateListItemDto,
  ) {
    const data = await this.listItemsService.addItem(user, listId, dto);
    return { data };
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk reorder items in a list' })
  async reorderItems(
    @CurrentUser() user: AuthUser,
    @Param('listId') listId: string,
    @Body() dto: ReorderItemsDto,
  ) {
    const data = await this.listItemsService.reorderItems(user, listId, dto);
    return { data };
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update a list item' })
  async updateItem(
    @CurrentUser() user: AuthUser,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateListItemDto,
  ) {
    const data = await this.listItemsService.updateItem(
      user,
      listId,
      itemId,
      dto,
    );
    return { data };
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an item from a list' })
  @ApiResponse({ status: 204, description: 'Item removed' })
  async removeItem(
    @CurrentUser() user: AuthUser,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.listItemsService.removeItem(user, listId, itemId);
  }
}
