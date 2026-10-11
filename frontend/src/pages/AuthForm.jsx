import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(isRegister ? "/api/auth/register" : "/api/auth/login", form);
      login(data);
      nav(data.role === "ADMIN" ? "/admin/orders" : "/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel narrow" onSubmit={submit}>
      <h2>{isRegister ? "Create your account" : "Log in"}</h2>
      {isRegister && <label>Name<input name="name" value={form.name} onChange={change} required /></label>}
      <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
      <label>Password<input type="password" name="password" value={form.password} onChange={change} required minLength={isRegister ? 6 : undefined} /></label>
      {isRegister && <label>Phone<input name="phone" value={form.phone} onChange={change} /></label>}
      {isRegister && <label>Address<textarea name="address" rows="2" value={form.address} onChange={change} /></label>}
      {error && <p className="error">{error}</p>}
      <button className="btn wide" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Sign up" : "Log in"}</button>
      <p className="muted small">
        {isRegister ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
      </p>
    </form>
  );
}
