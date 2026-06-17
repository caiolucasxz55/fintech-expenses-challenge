import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import {
  CreateTransactionDto,
  FilterTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterTransactionDto) {
    return this.transactionsService.findAll(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a transaction' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
