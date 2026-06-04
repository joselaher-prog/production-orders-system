import { ProductionOrder } from '@po/types';
/**
 * Rescheduling Algorithm
 *
 * Handles conflicts when 2+ orders in "planned" state share overlapping date ranges.
 * Reorders them sequentially (one after another) prioritized by ascending createdAt date,
 * keeping original duration.
 *
 * Edge cases handled:
 * - Orders with same duration are reordered without gaps
 * - createdAt ordering ensures deterministic behavior
 * - Only "planned" orders are considered
 * - Original duration is preserved
 */
export declare function findConflictingOrders(orders: ProductionOrder[]): ProductionOrder[][];
export declare function hasDateConflict(order1: ProductionOrder, order2: ProductionOrder): boolean;
export declare function getDurationInDays(order: ProductionOrder): number;
export declare function rescheduleConflictingOrders(conflictGroup: ProductionOrder[]): ProductionOrder[];
export declare function rescheduleAllConflicts(orders: ProductionOrder[]): ProductionOrder[];
