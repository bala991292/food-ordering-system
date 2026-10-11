import { useEffect, useState } from "react";
import api, { errMsg, money } from "../api.js";

const blank = { name: "", description: "", price: "", imageUrl: "", available: true, categoryId: "" };

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [newCat, setNewCat] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([api.get("/api/foods"), api.get("/api/categories")])
      .then(([f, c]) => { setFoods(f.data); setCats(c.data); })
      .catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const save = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    const body = { ...form, price: Number(form.price), categoryId: form.categoryId ? Number(form.categoryId) : null };
    try {
      if (editing) await api.put(`/api/foods/${editing}`, body);
      else await api.post("/api/foods", body);
      setMsg(editing ? "Item updated" : "Item added");
      setForm(blank); setEditing(null); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (f) => {
    setEditing(f.id);
    setForm({ name: f.name, description: f.description || "", price: f.price, imageUrl: f.imageUrl || "",
      available: f.available, categoryId: f.category?.id || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (f) => {
    if (!window.confirm(`Delete ${f.name}?`)) return;
    setError(""); setMsg("");
    try { const { data } = await api.delete(`/api/foods/${f.id}`); setMsg(data.message); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  const toggle = async (f) => {
    try {
      await api.put(`/api/foods/${f.id}`, { name: f.name, description: f.description, price: f.price,
        imageUrl: f.imageUrl, available: !f.available, categoryId: f.category?.id || null });
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const addCat = async (e) => {
    e.preventDefault();
    setError("");
    try { await api.post("/api/categories", { name: newCat }); setNewCat(""); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h2>Manage menu</h2>
      {msg && <p className="ok">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <div className="two-col">
        <form className="panel" onSubmit={save}>
          <h3>{editing ? "Edit item" : "Add an item"}</h3>
          <label>Name<input name="name" value={form.name} onChange={change} required /></label>
          <label>Description<textarea name="description" rows="2" value={form.description} onChange={change} /></label>
          <label>Price (₹)<input name="price" type="number" min="1" step="0.01" value={form.price} onChange={change} required /></label>
          <label>Image URL<input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://…" /></label>
          <label>Category
            <select name="categoryId" value={form.categoryId} onChange={change}>
              <option value="">No category</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="inline"><input type="checkbox" name="available" checked={form.available} onChange={change} /> Available to order</label>
          <div className="row">
            <button className="btn">{editing ? "Save changes" : "Add item"}</button>
            {editing && <button type="button" className="btn ghost" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
          </div>
        </form>

        <form className="panel" onSubmit={addCat}>
          <h3>Categories</h3>
          <div className="chips">{cats.map((c) => <span className="chip" key={c.id}>{c.name}</span>)}</div>
          <label>New category<input value={newCat} onChange={(e) => setNewCat(e.target.value)} required /></label>
          <button className="btn">Add category</button>
        </form>
      </div>

      <table className="table">
        <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.category?.name || "-"}</td>
              <td>{money(f.price)}</td>
              <td><button className="link" onClick={() => toggle(f)}>{f.available ? "Available" : "Sold out"}</button></td>
              <td className="actions">
                <button className="link" onClick={() => edit(f)}>Edit</button>
                <button className="link danger" onClick={() => remove(f)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
