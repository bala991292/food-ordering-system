import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./AuthContext.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import AdminFoods from "./pages/AdminFoods.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

function Protected({ children, admin }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Protected><MyOrders /></Protected>} />
          <Route path="/admin/foods" element={<Protected admin><AdminFoods /></Protected>} />
          <Route path="/admin/orders" element={<Protected admin><AdminOrders /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
