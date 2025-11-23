import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { fetchSingleCustomer } from "../../api/api";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchSingleCustomer(id);
        setCustomer(res.data);
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-2xl shadow-2xl text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
          <p className="text-gray-400 mb-6">The requested customer could not be loaded.</p>
          <Link
            to="/admin/customers"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 inline-block"
          >
            Back to Customers
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in">
                {customer.name}
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4"></div>
              <p className="text-gray-300">Customer Details</p>
            </div>
            <div className="text-6xl opacity-20 transform hover:scale-110 transition-transform duration-300">
              👤
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-xl border border-gray-700 transform hover:translate-y-[-4px] transition-all duration-300">
          <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
            <span>📋</span>
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              label="Email Address" 
              value={customer.email} 
              icon="📧"
            />
            <InfoItem 
              label="Mobile Number" 
              value={customer.mobile} 
              icon="📱"
            />
            <InfoItem 
              label="Address" 
              value={customer.address} 
              icon="📍"
              fullWidth
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <ActionButton
              to={`/admin/customers/${id}/create-order`}
              text="Create New Order"
              description="Start a new order for this customer"
              icon="🛒"
              color="from-blue-500 to-purple-600"
            />
            <ActionButton
              to={`/admin/customers/${id}/orders`}
              text="View Order History"
              description="See all previous orders"
              icon="📊"
              color="from-green-500 to-teal-600"
            />
          </div>
        </div>

        {/* Additional Stats/Info can be added here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Orders" 
            value="12" 
            icon="📦"
            trend="+2 this month"
          />
          <StatCard 
            title="Total Spent" 
            value="$2,847" 
            icon="💰"
            trend="+$340 this month"
          />
          <StatCard 
            title="Member Since" 
            value="Jan 2024" 
            icon="⭐"
            trend="3 months"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

// Reusable Info Item Component
function InfoItem({ label, value, icon, fullWidth = false }) {
  return (
    <div className={`${fullWidth ? 'md:col-span-2' : ''} group`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <label className="text-gray-400 text-sm font-medium">{label}</label>
      </div>
      <p className="text-white font-semibold text-lg pl-8 border-l-2 border-blue-500 py-1 transform hover:translate-x-2 transition-transform duration-300">
        {value || "Not provided"}
      </p>
    </div>
  );
}

// Reusable Action Button Component
function ActionButton({ to, text, description, icon, color }) {
  return (
    <Link
      to={to}
      className={`flex-1 bg-gradient-to-r ${color} text-white p-4 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="font-semibold text-lg">{text}</span>
      </div>
      <p className="text-blue-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {description}
      </p>
    </Link>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 rounded-xl border border-gray-700 transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
        <span className="text-2xl opacity-70">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-green-400 text-xs">{trend}</p>
    </div>
  );
}