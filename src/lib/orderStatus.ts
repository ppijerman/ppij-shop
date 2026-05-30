export function getOrderStatusLabel(status: string): string {
  return status
    .split('_')
    .map(word => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}

export function getOrderStatusColor(status: string) {
  switch (status) {
    case 'AWAITING_PAYMENT': return '#f39200';
    case 'PAYMENT_REVIEW': return '#2196f3';
    case 'PROCESSING': return '#9c27b0';
    case 'SHIPPED': return '#3f51b5';
    case 'DONE': return '#4caf50';
    case 'CANCELLED': return '#616161';
    default: return '#9e9e9e';
  }
}
