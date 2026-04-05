import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { ReceiptsService } from './receipts.service';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload a receipt image for processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Receipt image (JPEG, PNG, or PDF, max 10MB)',
        },
        purchaseDate: {
          type: 'string',
          format: 'date',
          description: 'Purchase date (ISO format)',
        },
        merchantName: {
          type: 'string',
          description: 'Name of the merchant/store',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 202, description: 'Receipt uploaded and pending processing' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadReceiptDto,
  ) {
    const data = await this.receiptsService.upload(user, file, dto);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated receipts for household' })
  @ApiResponse({ status: 200, description: 'Paginated list of receipts' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryReceiptsDto,
  ) {
    return this.receiptsService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt detail with items' })
  @ApiResponse({ status: 200, description: 'Receipt with parsed items' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const data = await this.receiptsService.findOne(user, id);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a receipt (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Receipt deleted' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    await this.receiptsService.remove(user, id);
  }
}
