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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JoinHouseholdDto } from './dto/join-household.dto';

@ApiTags('Households')
@ApiBearerAuth()
@Controller('households')
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new household' })
  @ApiResponse({ status: 201, description: 'Household created' })
  @ApiResponse({ status: 409, description: 'User already has a household' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateHouseholdDto,
  ) {
    const data = await this.householdsService.create(user, dto);
    return { data };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user household with members' })
  async getMyHousehold(@CurrentUser() user: AuthUser) {
    const data = await this.householdsService.getMyHousehold(user);
    return { data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update household name (ADMIN only)' })
  async updateMyHousehold(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateHouseholdDto,
  ) {
    const data = await this.householdsService.updateMyHousehold(user, dto);
    return { data };
  }

  @Post('me/invite')
  @ApiOperation({ summary: 'Generate an invite code (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  async createInvite(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInviteDto,
  ) {
    const data = await this.householdsService.createInvite(user, dto);
    return { data };
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a household with invite code' })
  async joinHousehold(
    @CurrentUser() user: AuthUser,
    @Body() dto: JoinHouseholdDto,
  ) {
    const data = await this.householdsService.joinHousehold(user, dto);
    return { data };
  }

  @Get('me/invites')
  @ApiOperation({ summary: 'List all invites (ADMIN only)' })
  async listInvites(@CurrentUser() user: AuthUser) {
    const data = await this.householdsService.listInvites(user);
    return { data };
  }

  @Delete('me/invites/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel an invite (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Invite cancelled' })
  async cancelInvite(
    @CurrentUser() user: AuthUser,
    @Param('id') inviteId: string,
  ) {
    await this.householdsService.cancelInvite(user, inviteId);
  }

  @Delete('me/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('userId') memberUserId: string,
  ) {
    await this.householdsService.removeMember(user, memberUserId);
  }
}
