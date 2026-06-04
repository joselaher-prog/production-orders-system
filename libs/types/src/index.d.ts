export type ProductionOrderStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed';
export interface ProductionOrder {
    id: string;
    reference: string;
    product: string;
    quantity: number;
    startDate: string;
    endDate: string;
    status: ProductionOrderStatus;
    createdAt: string;
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
    orderIds?: string[];
}
export interface RescheduleConflictResponse {
    success: boolean;
    message: string;
    updatedOrders?: ProductionOrder[];
}
