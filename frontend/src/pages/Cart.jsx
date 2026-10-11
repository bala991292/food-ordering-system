import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg, money } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";

export default function Cart() {
  const { items, setQty, clear, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ customerName: user?.name || "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const place = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/orders", {
        ...form,
        items: items.map((i) => ({ foodId: i.food.id, quantity: i.qty })),
      });
      clear();
      nav("/orders");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <p className="muted">Pick something from the menu to get started.</p>
        <Link className="btn" to="/">Browse the menu</Link>
      </div>
    );

  return (
    <div className="two-col">
      <section>
        <h2>Your cart</h2>
        {items.map(({ food, qty }) => (
          <div className="line" key={food.id}>
            <div>
              <strong>{food.name}</strong>
              <div className="muted small">{money(food.price)} each</div>
            </div>
            <div className="qty">
              <button onClick={() => setQty(food.id, qty - 1)} aria-label={`Remove one ${food.name}`}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(food.id, qty + 1)} aria-label={`Add one ${food.name}`}>+</button>
            </div>
            <strong>{money(qty * Number(food.price))}</strong>
          </div>
        ))}
        <div className="line total"><span>Total</span><strong>{money(total)}</strong></div>
      </section>

      <section className="panel">
        <h2>Delivery details</h2>
        {!user ? (
          <p>Please <Link to="/login">log in</Link> or <Link to="/register">create an account</Link> to place your order.</p>
        ) : (
          <form onSubmit={place}>
            <label>Name<input name="customerName" value={form.customerName} onChange={change} required /></label>
            <label>Phone<input name="phone" value={form.phone} onChange={change} required pattern="[0-9+\- ]{7,15}" title="Enter a valid phone number" /></label>
            <label>Address<textarea name="address" rows="3" value={form.address} onChange={change} required /></label>
            {error && <p className="error">{error}</p>}
            <button className="btn wide" disabled={busy}>{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
          </form>
        )}
      </section>
    </div>
  );
}
