import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/Products/ProductList";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";
import CustomerList from "./pages/Customers/CustomerList";
import OrderList from "./pages/Orders/OrderList";
import Login from "./pages/Login";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import CreateOrder from "./pages/Customers/CreateOrder";
import BillView from "./pages/Bills/BillView";
import ApproveBill from "./pages/Customers/ApproveBill";
import RejectBill from "./pages/Customers/RejectBill";
import AdvancePayment from "./pages/Customers/AdvancePayment";
import PublicBillView from "./pages/PublicBillView";
import OrderDetails from "./pages/Orders/OrderDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<Dashboard />} />

      {/* PRODUCTS */}
      <Route path="/admin/products" element={<ProductList />} />
      <Route path="/admin/products/add" element={<AddProduct />} />
      <Route path="/admin/products/edit/:id" element={<EditProduct />} />

      {/* CUSTOMERS */}
      <Route path="/admin/customers" element={<CustomerList />} />
      <Route path="/admin/customers/:id" element={<CustomerDetails/>} />
      <Route path="/admin/customers/:id/create-order" element={<CreateOrder/>} />

      {/* ORDERS */}
      <Route path="/admin/orders" element={<OrderList />} />

      {/* BILLS */}
      <Route path="/admin/bills/:id" element={<BillView/>} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/customers/:id/approve" element={<ApproveBill/>} />
<Route path="/admin/customers/:id/reject" element={<RejectBill/>} />
<Route path="/admin/customers/:id/advance" element={<AdvancePayment/>} />
<Route path="/bill/:token" element={<PublicBillView/>} />
<Route path="/admin/orders/:id" element={<OrderDetails/>} />



    </Routes>
  );
}
