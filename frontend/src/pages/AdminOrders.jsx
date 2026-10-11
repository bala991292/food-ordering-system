import { useEffect, useState } from "react";
import api, { errMsg, money } from "../api.js";
import StatusPill, { STATUSES, statusLabel } from "../components/StatusPill.jsx";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ACTIVE");
  const [error, setError] = useState("");

  const load = () => api.get("/api/admin/orders").then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/api/admin/orders/${id}/status`, { status });
      setOrders((cur) => cur.map((o) => (o.id === id ? data : o)));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const done = (o) => o.status === "DELIVERED" || o.status === "CANCELLED";
  const shown = orders.filter((o) => (filter === "ACTIVE" ? !done(o) : filter === "HISTORY" ? done(o) : true));

  return (
    <>
      <div className="row">
        <h2>Orders</h2>
        <div className="chips">
          {[["ACTIVE", "Current"], ["HISTORY", "History"], ["ALL", "All"]].map(([k, l]) => (
            <button key={k} className={filter === k ? "chip on" : "chip"} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {shown.length === 0 && <p className="muted">No orders here.</p>}
      {shown.map((o) => (
        <article className="order" key={o.id}>
          <div className="row">
            <strong>#{o.id} · {o.customerName}</strong>
            <StatusPill status={o.status} />
          </div>
          <div className="muted small">{new Date(o.createdAt).toLocaleString()} · {o.phone}</div>
          <div className="small">{o.address}</div>
          <ul>{o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.foodName}</li>)}</ul>
          <div className="row">
            <label className="inline">Status
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </label>
            <strong>{money(o.totalPrice)}</strong>
          </div>
        </article>
      ))}
    </>
  );
}
