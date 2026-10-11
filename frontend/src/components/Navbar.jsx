import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">Tiffin Box</Link>
      <nav>
        <NavLink to="/" end>Menu</NavLink>
        {user && !isAdmin && <NavLink to="/orders">My orders</NavLink>}
        {isAdmin && <NavLink to="/admin/orders">Orders</NavLink>}
        {isAdmin && <NavLink to="/admin/foods">Manage menu</NavLink>}
        <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
      </nav>
      <div className="nav-user">
        {user ? (
          <>
            <span className="muted">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn ghost" onClick={() => { logout(); nav("/"); }}>Log out</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">Log in</Link>
            <Link className="btn" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
