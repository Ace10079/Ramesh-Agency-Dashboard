import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, syncOrderStatus } from "../../api/api";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetchOrders();
      const ordersData = Array.isArray(res.data) ? res.data : [];
      
      // Sync status for all orders
      const updatedOrders = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const syncRes = await syncOrderStatus(order._id);
            return syncRes.data.order || order;
          } catch (err) {
            console.error(`Error syncing order ${order._id}:`, err);
            return order;
          }
        })
      );
      
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-gray-800 text-white';
      case 'APPROVED': return 'bg-gray-600 text-white';
      case 'PENDING': return 'bg-gray-400 text-gray-900';
      case 'REJECTED': return 'bg-gray-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return '✅';
      case 'APPROVED': return '👍';
      case 'PENDING': return '⏳';
      case 'REJECTED': return '❌';
      default: return '📦';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Completed';
      case 'APPROVED': return 'Approved';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      default: return 'Pending';
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.mobile?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status?.toUpperCase() === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status?.toUpperCase() === 'PENDING').length,
    approved: orders.filter(o => o.status?.toUpperCase() === 'APPROVED').length,
    completed: orders.filter(o => o.status?.toUpperCase() === 'COMPLETED').length,
    rejected: orders.filter(o => o.status?.toUpperCase() === 'REJECTED').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white text-gray-900 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Order Management</h1>
              <div className="w-20 h-1 bg-gray-800 rounded-full mb-2"></div>
              <p className="text-gray-600">
                Manage and track all customer orders in one place
              </p>
            </div>
            <div className="text-4xl lg:text-6xl opacity-20 transform hover:scale-110 transition-transform duration-300">
              📦
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total"
            value={statusCounts.all}
            icon="📦"
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <StatCard
            title="Pending"
            value={statusCounts.pending}
            icon="⏳"
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          />
          <StatCard
            title="Approved"
            value={statusCounts.approved}
            icon="👍"
            active={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
          />
          <StatCard
            title="Completed"
            value={statusCounts.completed}
            icon="✅"
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
          />
          <StatCard
            title="Rejected"
            value={statusCounts.rejected}
            icon="❌"
            active={statusFilter === 'rejected'}
            onClick={() => setStatusFilter('rejected')}
          />
        </div>

        {/* Search and Controls */}
        <div className="bg-white text-gray-900 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search orders by customer, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="bg-gray-900 text-white px-4 lg:px-6 py-3 rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Refresh All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {searchTerm || statusFilter !== 'all' ? '🔍' : '📦'}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {searchTerm || statusFilter !== 'all' 
                  ? "No orders found" 
                  : "No orders yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search or filter terms"
                  : "Orders will appear here once customers start placing them"}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>📋</span>
                  Orders List
                  <span className="text-sm text-gray-600 font-normal ml-2">
                    ({filteredOrders.length} orders)
                  </span>
                </h3>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                <div className="space-y-4 p-4">
                  {filteredOrders.map((order) => (
                    <MobileOrderCard
                      key={order._id}
                      order={order}
                      onClick={handleOrderClick}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Grid View */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    index={index}
                    onClick={handleOrderClick}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getStatusText={getStatusText}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white text-gray-900 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
        active ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-600 text-sm font-medium">{title}</h4>
        <span className="text-xl opacity-70 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Order Card Component for Desktop
function OrderCard({ order, index, onClick, getStatusColor, getStatusIcon, getStatusText }) {
  return (
    <div 
      onClick={() => onClick(order._id)}
      className="bg-white rounded-lg border border-gray-200 transform hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden hover:shadow-md"
    >
      {/* Status Header */}
      <div className={`${getStatusColor(order.status)} p-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(order.status)}</span>
            <span className="font-semibold text-sm">
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="text-sm font-mono">
            #{order._id?.slice(-6).toUpperCase() || 'N/A'}
          </div>
        </div>
      </div>

      {/* Order Content */}
      <div className="p-4">
        {/* Customer Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {order.customerId?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
              {order.customerId?.name || 'Customer'}
            </h3>
            <p className="text-sm text-gray-600">
              {order.customerId?.mobile || 'No contact'}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-semibold text-gray-900">{order.items?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-900">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{order.grandTotal?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-200">
          <button className="w-full bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group-hover:bg-gray-300">
            <span>👁️</span>
            View Details
            <span className="transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile Order Card Component
function MobileOrderCard({ order, onClick, getStatusColor, getStatusIcon, getStatusText }) {
  return (
    <div 
      onClick={() => onClick(order._id)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {order.customerId?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{order.customerId?.name || 'Customer'}</h3>
            <p className="text-sm text-gray-600">{order.customerId?.mobile || 'No contact'}</p>
          </div>
        </div>
        <div className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          <span>{getStatusIcon(order.status)}</span>
          {getStatusText(order.status)}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-mono text-gray-900">#{order._id?.slice(-6).toUpperCase() || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-semibold text-gray-900">{order.items?.length || 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="text-gray-900">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total:</span>
          <span className="font-bold text-gray-900">
            ₹{order.grandTotal?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-200">
        <button className="w-full bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold flex items-center justify-center gap-2">
          <span>👁️</span>
          View Details
        </button>
      </div>
    </div>
  );
}