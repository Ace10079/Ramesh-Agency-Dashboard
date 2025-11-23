import axios from "axios";

const API = axios.create({
  baseURL: "https://ramesh-agency-backend.onrender.com",
});
//https://ramesh-agency-backend.onrender.com
//http://localhost:5000
// ---------------------- PRODUCTS ----------------------
export const fetchProducts = () => API.get("/product/list");
export const createProduct = (data) => API.post("/product/create", data);
export const updateProduct = (id, data) => API.patch(`/product/update/${id}`, data);
export const deleteProduct = (id) => API.delete(`/product/delete/${id}`);
export const fetchSingleProduct = (id) => API.get(`/product/${id}`);

// ---------------------- CUSTOMERS ----------------------
export const fetchCustomers = () => API.get("/customer/list");
export const fetchSingleCustomer = (id) => API.get(`/customer/${id}`);

// ---------------------- BILLS (ORDERS) ----------------------
export const createBill = (data) => API.post("/bill/create", data);
export const fetchBills = () => API.get("/bill/list");
export const fetchBill = (id) => API.get(`/bill/${id}`);

// ✔ Public bill fetch (Customer page)
export const fetchBillPublic = (token) => API.get(`/bill/token/${token}`);

// Orders list = bills list normalized
// ---------------------- ORDERS ----------------------
export const fetchOrders = () => API.get("/order/list");
export const fetchSingleOrder = (id) => API.get(`/order/${id}`);
// In api.js - add these
export const syncOrderStatus = (orderId) => API.patch(`/order/${orderId}/sync-status`);
export const updateOrderStatus = (orderId, data) => API.patch(`/order/${orderId}/status`, data);

// ---------------------- CUSTOMER ACTIONS ON BILL ----------------------
// CHANGED: POST to PATCH to match backend
export const approveBill = (billId) =>
  API.patch(`/bill/${billId}/approve`);

// CHANGED: POST to PATCH to match backend
export const rejectBill = (billId, data) =>
  API.patch(`/bill/${billId}/reject`, data);

// CHANGED: POST to PATCH to match backend
export const addAdvance = (billId, data) =>
  API.patch(`/bill/${billId}/advance`, data);

// ADDED: New endpoint for completing payment
export const completePayment = (billId) =>
  API.patch(`/bill/${billId}/complete`);
  

export default API;