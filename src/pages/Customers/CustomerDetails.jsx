import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchCustomers } from "../../api/api";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const cRes = await fetchCustomers();
        
        const cust = cRes.data.find(c => c._id === id);
        if (!cust) {
          alert("Customer not found");
          navigate("/admin/customers");
          return;
        }
        setCustomer(cust);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-6">The requested customer could not be loaded.</p>
          <Link
            to="/admin/customers"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 inline-block"
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
        <div className="bg-white text-gray-900 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">{customer.name}</h1>
                  <div className="w-20 h-1 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              {/* Customer Details */}
              <div className="space-y-4">
                <DetailItem 
                  label="Email Address" 
                  value={customer.email} 
                  icon="📧"
                />
                <DetailItem 
                  label="Mobile Number" 
                  value={customer.mobile} 
                  icon="📱"
                />
                <DetailItem 
                  label="Address" 
                  value={customer.address} 
                  icon="📍"
                />
              </div>
            </div>

            {/* Create Order Button */}
            <div className="lg:w-auto w-full">
              <Link 
                to={`/admin/customers/${id}/create-order`}
                className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2 group"
              >
                <span className="transform group-hover:scale-110 transition-transform">🛒</span>
                Create Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Detail Item Component
function DetailItem({ label, value, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-700 font-medium text-sm">{label}</span>
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-semibold break-words">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}