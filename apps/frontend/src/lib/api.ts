import axios from 'axios';
import { ProductionOrder, CreateProductionOrderDto, UpdateProductionOrderDto } from '@po/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productionOrdersApi = {
  async getAll(): Promise<ProductionOrder[]> {
    try {
      const response = await api.get('/api/production-orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  },

  async getOne(id: string): Promise<ProductionOrder | null> {
    try {
      const response = await api.get(`/api/production-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      return null;
    }
  },

  async create(data: CreateProductionOrderDto): Promise<ProductionOrder | null> {
    try {
      const response = await api.post('/api/production-orders', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  async update(id: string, data: UpdateProductionOrderDto): Promise<ProductionOrder | null> {
    try {
      const response = await api.put(`/api/production-orders/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/production-orders/${id}`);
    } catch (error) {
      console.error(`Failed to delete order ${id}:`, error);
      throw error;
    }
  },

  async rescheduleConflicts() {
    try {
      const response = await api.post('/api/production-orders/reschedule/conflicts', {});
      return response.data;
    } catch (error) {
      console.error('Failed to reschedule conflicts:', error);
      throw error;
    }
  },
};
