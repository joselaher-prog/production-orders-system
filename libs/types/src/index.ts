export type ProductionOrderStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed';

export interface ProductionOrder {
  id: string;
  reference: string;
  product: string;
  quantity: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: ProductionOrderStatus;
  createdAt: string; // ISO date
}

export interface CreateProductionOrderDto {
  reference: string;
  product: string;
  quantity: number;
  startDate: string;
  endDate: string;
}

export interface UpdateProductionOrderDto {
  reference?: string;
  product?: string;
  quantity?: number;
  startDate?: string;
  endDate?: string;
  status?: ProductionOrderStatus;
}

export interface RescheduleConflictRequest {
  orderIds?: string[]; // If empty, reschedule all conflicting orders
}

export interface RescheduleConflictResponse {
  success: boolean;
  message: string;
  updatedOrders?: ProductionOrder[];
}
