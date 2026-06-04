import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductionOrdersService } from './production-orders.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  RescheduleConflictRequest,
  ProductionOrder,
} from '@po/types';

@Controller('api/production-orders')
export class ProductionOrdersController {
  constructor(private readonly service: ProductionOrdersService) {}

  @Get()
  async findAll(): Promise<ProductionOrder[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductionOrder> {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateProductionOrderDto,
  ): Promise<ProductionOrder> {
    return this.service.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }

  @Post('reschedule/conflicts')
  async rescheduleConflicts(
    @Body() request: RescheduleConflictRequest,
  ): Promise<{ success: boolean; message: string; updatedOrders?: ProductionOrder[] }> {
    return this.service.rescheduleConflicts(request);
  }
}
