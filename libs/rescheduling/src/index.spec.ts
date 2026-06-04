import {
  findConflictingOrders,
  hasDateConflict,
  getDurationInDays,
  rescheduleConflictingOrders,
} from './index';
import { ProductionOrder } from '@po/types';

describe('Rescheduling Algorithm', () => {
  const createOrder = (
    id: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    status: 'planned' | 'scheduled' = 'planned',
  ): ProductionOrder => ({
    id,
    reference: `REF-${id}`,
    product: 'Product A',
    quantity: 10,
    startDate,
    endDate,
    status,
    createdAt,
  });

  describe('hasDateConflict', () => {
    it('should detect overlapping date ranges', () => {
      const order1 = createOrder(
        '1',
        '2024-01-01',
        '2024-01-05',
        '2024-01-01',
      );
      const order2 = createOrder(
        '2',
        '2024-01-03',
        '2024-01-07',
        '2024-01-02',
      );

      expect(hasDateConflict(order1, order2)).toBe(true);
    });

    it('should not detect conflict when dates do not overlap', () => {
      const order1 = createOrder(
        '1',
        '2024-01-01',
        '2024-01-03',
        '2024-01-01',
      );
      const order2 = createOrder(
        '2',
        '2024-01-04',
        '2024-01-06',
        '2024-01-02',
      );

      expect(hasDateConflict(order1, order2)).toBe(false);
    });

    it('should handle edge case when end date equals start date of next order', () => {
      const order1 = createOrder(
        '1',
        '2024-01-01',
        '2024-01-03',
        '2024-01-01',
      );
      const order2 = createOrder(
        '2',
        '2024-01-03',
        '2024-01-06',
        '2024-01-02',
      );

      // This is a conflict as end date matches start date
      expect(hasDateConflict(order1, order2)).toBe(true);
    });
  });

  describe('getDurationInDays', () => {
    it('should calculate duration correctly', () => {
      const order = createOrder('1', '2024-01-01', '2024-01-05', '2024-01-01');
      expect(getDurationInDays(order)).toBe(5);
    });

    it('should handle same day duration', () => {
      const order = createOrder('1', '2024-01-01', '2024-01-01', '2024-01-01');
      expect(getDurationInDays(order)).toBe(1);
    });
  });

  describe('findConflictingOrders', () => {
    it('should find conflicting order groups', () => {
      const orders = [
        createOrder('1', '2024-01-01', '2024-01-05', '2024-01-01'),
        createOrder('2', '2024-01-03', '2024-01-07', '2024-01-02'),
        createOrder('3', '2024-01-10', '2024-01-12', '2024-01-03'),
      ];

      const conflicts = findConflictingOrders(orders);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].length).toBe(2);
    });

    it('should ignore non-planned orders', () => {
      const orders = [
        createOrder('1', '2024-01-01', '2024-01-05', '2024-01-01'),
        createOrder('2', '2024-01-03', '2024-01-07', '2024-01-02', 'scheduled'),
      ];

      const conflicts = findConflictingOrders(orders);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('rescheduleConflictingOrders', () => {
    it('should reschedule orders sequentially', () => {
      const orders = [
        createOrder('1', '2024-01-01', '2024-01-05', '2024-01-01'),
        createOrder('2', '2024-01-03', '2024-01-07', '2024-01-02'),
      ];

      const rescheduled = rescheduleConflictingOrders(orders);

      // Order 1 starts first (earlier createdAt)
      expect(rescheduled[0].startDate).toBe('2024-01-01');
      expect(rescheduled[0].endDate).toBe('2024-01-05');
      expect(rescheduled[0].status).toBe('scheduled');

      // Order 2 starts after order 1 ends
      expect(rescheduled[1].startDate).toBe('2024-01-06');
      expect(rescheduled[1].endDate).toBe('2024-01-10');
      expect(rescheduled[1].status).toBe('scheduled');
    });

    it('should preserve original duration', () => {
      const orders = [
        createOrder('1', '2024-01-01', '2024-01-03', '2024-01-01'), // 3 days
        createOrder('2', '2024-01-02', '2024-01-08', '2024-01-02'), // 7 days
      ];

      const rescheduled = rescheduleConflictingOrders(orders);

      expect(getDurationInDays(rescheduled[0])).toBe(3);
      expect(getDurationInDays(rescheduled[1])).toBe(7);
    });

    it('should sort by createdAt for deterministic ordering', () => {
      const orders = [
        createOrder('1', '2024-01-05', '2024-01-10', '2024-01-03'), // Later created
        createOrder('2', '2024-01-01', '2024-01-08', '2024-01-01'), // Earlier created
      ];

      const rescheduled = rescheduleConflictingOrders(orders);

      // Order 2 (earlier createdAt) should start first
      expect(rescheduled[0].id).toBe('2');
      expect(rescheduled[1].id).toBe('1');
    });
  });
});
