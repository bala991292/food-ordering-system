const LABELS = {
  PLACED: "Order placed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
export const STATUSES = Object.keys(LABELS);
export const statusLabel = (s) => LABELS[s] || s;

export default function StatusPill({ status }) {
  return <span className={"pill " + status.toLowerCase()}>{statusLabel(status)}</span>;
}
