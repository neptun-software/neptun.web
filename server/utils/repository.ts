import type { ChatConversationKeys, OrderByDirection } from '~/lib/types/chat';

export function parseOrderByString(order_by: string) {
  const orders = order_by.split(',').map((order) => {
    const [column, direction] = order.split(':') as [
      ChatConversationKeys,
      OrderByDirection,
    ];
    return { column, direction };
  });
  return orders;
}
