import { useEffect, useMemo, useState } from "react";
import api, { errMsg, money } from "../api.js";
import { useCart } from "../CartContext.jsx";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { add, items } = useCart();

  useEffect(() => {
    Promise.all([api.get("/api/foods"), api.get("/api/categories")])
      .then(([f, c]) => { setFoods(f.data); setCats(c.data); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => foods.filter((f) =>
      (!cat || f.category?.id === cat) && f.name.toLowerCase().includes(q.trim().toLowerCase())),
    [foods, cat, q]
  );
  const inCart = (id) => items.find((i) => i.food.id === id)?.qty || 0;

  return (
    <>
      <section className="hero">
        <h1>What are you eating today?</h1>
        <input className="search" placeholder="Search the menu" value={q} onChange={(e) => setQ(e.target.value)} />
      </section>

      <div className="chips">
        <button className={!cat ? "chip on" : "chip"} onClick={() => setCat(null)}>All</button>
        {cats.map((c) => (
          <button key={c.id} className={cat === c.id ? "chip on" : "chip"} onClick={() => setCat(c.id)}>{c.name}</button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading the menu…</p>}
      {!loading && !error && shown.length === 0 && <p className="muted">No dishes match your search.</p>}

      <div className="grid">
        {shown.map((f) => (
          <article key={f.id} className={"card" + (f.available ? "" : " off")}>
            {f.imageUrl ? <img src={f.imageUrl} alt={f.name} /> : <div className="ph">{f.name[0]}</div>}
            <div className="card-body">
              <h3>{f.name}</h3>
              <p className="muted small">{f.description}</p>
              <div className="row">
                <strong>{money(f.price)}</strong>
                {f.available ? (
                  <button className="btn" onClick={() => add(f)}>
                    {inCart(f.id) ? `Add another (${inCart(f.id)})` : "Add to cart"}
                  </button>
                ) : (
                  <span className="muted">Sold out</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
