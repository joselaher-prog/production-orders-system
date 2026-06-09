import axios from 'axios';
import { ProductionOrder, CreateProductionOrderDto, UpdateProductionOrderDto } from '@po/types';

// Asegura que la URL termine en / para que Axios concatene correctamente rutas relativas
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '') + '/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productionOrdersApi = {
  async getAll(): Promise<ProductionOrder[]> {
    try {
      const response = await api.get('production-orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  },

  async getOne(id: string): Promise<ProductionOrder | null> {
    try {
      const response = await api.get(`production-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      return null;
    }
  },

  async create(data: CreateProductionOrderDto): Promise<ProductionOrder | null> {
    try {
      const response = await api.post('production-orders', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Create Order Error Details:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateProductionOrderDto): Promise<ProductionOrder | null> {
    try {
      const response = await api.put(`production-orders/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`production-orders/${id}`);
    } catch (error) {
      console.error(`Failed to delete order ${id}:`, error);
      throw error;
    }
  },

  async rescheduleConflicts() {
    try {
      const response = await api.post('production-orders/reschedule/conflicts', {});
      return response.data;
    } catch (error) {
      console.error('Failed to reschedule conflicts:', error);
      throw error;
    }
  },
};
