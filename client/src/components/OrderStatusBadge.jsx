/** Colored badge showing order status */
const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_COLORS[status] || 'badge-info'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
