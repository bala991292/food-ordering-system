import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg, money } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/api/orders/my")
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // refresh status every 15s
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <h2>My orders</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && orders.length === 0 && (
        <div className="empty"><p className="muted">You haven't ordered yet.</p><Link className="btn" to="/">See the menu</Link></div>
      )}
      {orders.map((o) => (
        <article className="order" key={o.id}>
          <div className="row">
            <strong>Order #{o.id}</strong>
            <StatusPill status={o.status} />
          </div>
          <div className="muted small">{new Date(o.createdAt).toLocaleString()}</div>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx}>{i.quantity} × {i.foodName} <span className="muted">({money(i.unitPrice)})</span></li>
            ))}
          </ul>
          <div className="row"><span className="muted small">Delivering to {o.address}</span><strong>{money(o.totalPrice)}</strong></div>
        </article>
      ))}
    </>
  );
}
