import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrder,
  RescheduleConflictRequest,
} from '@po/types';
import { rescheduleAllConflicts } from '@po/rescheduling';

@Injectable()
export class ProductionOrdersService {
  private directusUrl = process.env.DATABASE_URL || 'http://localhost:8055';
  private directusToken = process.env.DATABASE_TOKEN || 'admin123';

  private async request(method: string, path: string, data?: any) {
    const url = `${this.directusUrl}/graphql`;
    const headers = {
      'Authorization': `Bearer ${this.directusToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios({
        method: 'post',
        url,
        headers,
        data: {
          query: path,
          variables: data,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Directus request error:', error);
      throw error;
    }
  }

  async findAll(): Promise<ProductionOrder[]> {
    // Mock for now - in production this would query Directus
    return [];
  }

  async findOne(id: string): Promise<ProductionOrder | null> {
    // Mock for now
    return null;
  }

  async create(createDto: CreateProductionOrderDto): Promise<ProductionOrder> {
    const order: ProductionOrder = {
      id: Math.random().toString(36).substr(2, 9),
      ...createDto,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };
    // In production, save to Directus
    return order;
  }

  async update(
    id: string,
    updateDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder | null> {
    // In production, update in Directus
    return null;
  }

  async delete(id: string): Promise<void> {
    // In production, delete from Directus
  }

  async rescheduleConflicts(
    request: RescheduleConflictRequest,
  ): Promise<{ success: boolean; message: string; updatedOrders?: ProductionOrder[] }> {
    try {
      // Get all orders from Directus
      const allOrders = await this.findAll();

      // Filter if specific order IDs provided
      const ordersToCheck = request.orderIds && request.orderIds.length > 0
        ? allOrders.filter((o) => request.orderIds!.includes(o.id))
        : allOrders;

      // Apply rescheduling algorithm
      const rescheduled = rescheduleAllConflicts(ordersToCheck);

      // Update Directus
      for (const order of rescheduled) {
        await this.update(order.id, {
          startDate: order.startDate,
          endDate: order.endDate,
          status: order.status,
        });
      }

      return {
        success: true,
        message: `Rescheduled ${rescheduled.length} conflicting orders`,
        updatedOrders: rescheduled,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Error rescheduling conflicts: ${errorMessage}`,
      };
    }
  }
}
