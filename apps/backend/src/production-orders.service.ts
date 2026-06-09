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
  private directusUrl = (process.env.DATABASE_URL || 'http://localhost:8055').replace(/\/$/, '');
  private directusToken = (process.env.DATABASE_TOKEN || 'BsCq6ex4frS5ZNLJcjsReL9917a4WB6F').trim().replace(/"/g, '');
  private collection = 'orders';

  constructor() {
    if (!this.directusToken) {
      console.error('[Backend] CRITICAL ERROR: DATABASE_TOKEN is not defined in environment variables!');
    }
    const maskedToken = this.directusToken ? `${this.directusToken.substring(0, 6)}...` : 'MISSING';
    console.log(`[Backend] Directus Connection -> URL: ${this.directusUrl} | Token: ${maskedToken} | Collection: ${this.collection}`);
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.directusToken}`,
      'Content-Type': 'application/json',
    };
  }

  async findAll(): Promise<ProductionOrder[]> {
    const url = `${this.directusUrl}/items/${this.collection}`;
    try {
      const response = await axios.get(url, { headers: this.headers });
      return response.data.data;
    } catch (error: any) {
      this.logError('fetch', error, url);
      return [];
    }
  }

  async findOne(id: string): Promise<ProductionOrder | null> {
    const url = `${this.directusUrl}/items/${this.collection}/${id}`;
    try {
      const response = await axios.get(url, { headers: this.headers });
      return response.data.data;
    } catch (error: any) {
      this.logError('fetch one', error, url);
      return null;
    }
  }

  async create(createDto: CreateProductionOrderDto): Promise<ProductionOrder> {
    const url = `${this.directusUrl}/items/${this.collection}`;
    try {
      const response = await axios.post(
        url,
        {
          ...createDto,
          status: 'planned',
        },
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error: any) {
      this.logError('create', error, url);
      throw error;
    }
  }

  async update(
    id: string,
    updateDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder | null> {
    const url = `${this.directusUrl}/items/${this.collection}/${id}`;
    try {
      const response = await axios.patch(
        url,
        updateDto,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error: any) {
      this.logError('update', error, url);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const url = `${this.directusUrl}/items/${this.collection}/${id}`;
    try {
      await axios.delete(url, { headers: this.headers });
    } catch (error: any) {
      this.logError('delete', error, url);
      throw error;
    }
  }

  private logError(action: string, error: any, url?: string) {
    const status = error.response?.status;
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const details = error.response?.data?.errors?.[0]?.message || error.message || error;
    console.error(`[Backend] Directus ${action} error (${status || errorCode}) at ${url}:`, details);
    if (status === 401) {
      console.warn('[Backend] ALERT: Unauthorized. Please check if the Static Token is correctly set in the Directus User profile.');
    }
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
