"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConflictingOrders = findConflictingOrders;
exports.hasDateConflict = hasDateConflict;
exports.getDurationInDays = getDurationInDays;
exports.rescheduleConflictingOrders = rescheduleConflictingOrders;
exports.rescheduleAllConflicts = rescheduleAllConflicts;
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
function findConflictingOrders(orders) {
    const plannedOrders = orders.filter((o) => o.status === 'planned');
    const conflictGroups = [];
    for (let i = 0; i < plannedOrders.length; i++) {
        let group = [plannedOrders[i]];
        for (let j = i + 1; j < plannedOrders.length; j++) {
            if (hasDateConflict(plannedOrders[i], plannedOrders[j])) {
                group.push(plannedOrders[j]);
            }
        }
        if (group.length > 1) {
            // Check if this group is already in conflictGroups (avoid duplicates)
            const isNew = !conflictGroups.some((g) => g.every((order) => group.some((o) => o.id === order.id)));
            if (isNew) {
                conflictGroups.push(group);
            }
        }
    }
    return conflictGroups;
}
function hasDateConflict(order1, order2) {
    const start1 = new Date(order1.startDate);
    const end1 = new Date(order1.endDate);
    const start2 = new Date(order2.startDate);
    const end2 = new Date(order2.endDate);
    // Check if date ranges overlap
    return start1 <= end2 && start2 <= end1;
}
function getDurationInDays(order) {
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
function rescheduleConflictingOrders(conflictGroup) {
    // Sort by createdAt (ascending) to determine order
    const sorted = [...conflictGroup].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    // Reschedule sequentially
    let currentDate = new Date(sorted[0].startDate);
    return sorted.map((order) => {
        const duration = getDurationInDays(order);
        const newStartDate = new Date(currentDate);
        const newEndDate = new Date(currentDate);
        newEndDate.setDate(newEndDate.getDate() + duration - 1);
        const rescheduledOrder = {
            ...order,
            startDate: newStartDate.toISOString().split('T')[0],
            endDate: newEndDate.toISOString().split('T')[0],
            status: 'scheduled',
        };
        // Move currentDate to the day after this order ends
        currentDate.setDate(currentDate.getDate() + duration);
        return rescheduledOrder;
    });
}
function rescheduleAllConflicts(orders) {
    const conflictGroups = findConflictingOrders(orders);
    let result = [...orders];
    for (const group of conflictGroups) {
        const rescheduled = rescheduleConflictingOrders(group);
        result = result.map((order) => {
            const updated = rescheduled.find((r) => r.id === order.id);
            return updated || order;
        });
    }
    return result;
}
