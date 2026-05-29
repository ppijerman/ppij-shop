export function getOrderStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return '#f39200';
    case 'CONFIRMED': return '#2196f3';
    case 'PROCESSING': return '#9c27b0';
    case 'SHIPPED': return '#3f51b5';
    case 'DONE': return '#4caf50';
    case 'CANCELLED': return '#616161';
    default: return '#9e9e9e';
  }
}
