import AdminLayout from "../layout/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">Total Customers</div>
        <div className="bg-white p-6 rounded shadow">Total Products</div>
        <div className="bg-white p-6 rounded shadow">Total Orders</div>
      </div>
    </AdminLayout>
  );
}
