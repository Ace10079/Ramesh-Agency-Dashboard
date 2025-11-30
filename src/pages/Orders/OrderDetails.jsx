import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleOrder, syncOrderStatus } from "../../api/api";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const orderRes = await fetchSingleOrder(id);
        let orderData = orderRes.data;
        
        try {
          const syncRes = await syncOrderStatus(id);
          orderData = syncRes.data.order || orderData;
        } catch (syncErr) {
          console.error("Error syncing status:", syncErr);
        }
        
        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

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
      default: return status || 'Pending';
    }
  };

  const handleRefreshStatus = async () => {
    try {
      setSyncing(true);
      const syncRes = await syncOrderStatus(id);
      setOrder(syncRes.data.order);
    } catch (err) {
      console.error("Error refreshing status:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddMeasurement = () => {
    navigate(`/admin/orders/${id}/measurement`);
  };

  const handleViewMeasurements = () => {
    // You can navigate to a measurements list page or show in a modal
    // For now, let's navigate to the same measurement page but with a view mode
    navigate(`/admin/orders/${id}/measurement?view=true`);
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

  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
          >
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <button 
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-300 group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                Back to Orders
              </button>
              
              <div className="flex items-start gap-4">
                <div className="text-4xl mt-1">
                  📦
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">Order #{order._id?.slice(-8).toUpperCase()}</h1>
                  <div className="w-20 h-1 bg-gray-800 rounded-full mb-3"></div>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Created on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <div className={`${getStatusColor(order.status)} px-4 py-3 rounded-lg font-semibold text-base flex items-center gap-2 justify-center min-w-[140px]`}>
                <span>{getStatusIcon(order.status)}</span>
                {getStatusText(order.status)}
              </div>
              <button 
                onClick={handleRefreshStatus}
                disabled={syncing}
                className="bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center min-w-[140px]"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    Order Items
                    <div className="text-sm text-gray-600 font-normal mt-1">
                      {order.items?.length || 0} items in this order
                    </div>
                  </div>
                </h2>
              </div>

              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <OrderItem 
                    key={index} 
                    item={item} 
                    index={index} 
                  />
                ))}
              </div>

              {/* Grand Total */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-lg">Grand Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{order.grandTotal?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Measurement Actions Card */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">📏</span>
                Measurements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleAddMeasurement}
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Add Measurement</div>
                    <div className="text-blue-100 text-sm">Record new measurements</div>
                  </div>
                </button>

                <button 
                  onClick={handleViewMeasurements}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">👁️</span>
                  <div className="text-left">
                    <div className="font-semibold text-lg">View Measurements</div>
                    <div className="text-green-100 text-sm">See all measurements</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Order Timeline
              </h2>
              <div className="space-y-6">
                <TimelineItem 
                  status="Order Created"
                  date={order.createdAt}
                  description="Order was placed by customer"
                  active={true}
                  icon="📝"
                  isFirst={true}
                />
                <TimelineItem 
                  status="Order Processing"
                  date={order.updatedAt}
                  description="Order is being processed"
                  active={order.status !== 'PENDING'}
                  icon="⚙️"
                />
                <TimelineItem 
                  status={getStatusText(order.status)}
                  date={order.updatedAt}
                  description={`Order has been ${getStatusText(order.status).toLowerCase()}`}
                  active={true}
                  icon={getStatusIcon(order.status)}
                  isCurrent={true}
                  isLast={true}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">👤</span>
                Customer Information
              </h2>
              
              <div className="space-y-5">
                <InfoItem 
                  label="Full Name" 
                  value={order.customerId?.name}
                />
                <InfoItem 
                  label="Mobile Number" 
                  value={order.customerId?.mobile}
                />
                <InfoItem 
                  label="Email Address" 
                  value={order.customerId?.email}
                />
                <InfoItem 
                  label="Delivery Address" 
                  value={order.customerId?.address}
                />
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                Order Information
              </h2>
              
              <div className="space-y-5">
                <InfoItem 
                  label="Order ID" 
                  value={order._id?.slice(-8).toUpperCase()}
                />
                <InfoItem 
                  label="Total Items" 
                  value={order.items?.length || 0}
                />
                {order.billId && (
                  <InfoItem 
                    label="Linked Bill" 
                    value={order.billId?.slice(-8).toUpperCase()}
                  />
                )}
                <InfoItem 
                  label="Order Date" 
                  value={new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                />
                <InfoItem 
                  label="Last Updated" 
                  value={new Date(order.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <ActionButton
                  onClick={handleRefreshStatus}
                  disabled={syncing}
                  text="Sync Bill Status"
                  icon="🔄"
                  loading={syncing}
                />
                {order.billId && (
                  <ActionButton
                    onClick={() => navigate(`/admin/bills/${order.billId}`)}
                    text="View Linked Bill"
                    icon="🧾"
                  />
                )}
                <ActionButton
                  onClick={() => navigate('/admin/orders')}
                  text="Back to Orders"
                  icon="📋"
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Order Item Component
function OrderItem({ item, index }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 group">
      <div className="flex items-start gap-4 flex-1">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-lg text-sm font-semibold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base mb-1 truncate">
            {item.productName}
          </h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Quantity: {item.quantity}</span>
            <span>Unit Price: ₹{item.price}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right ml-4">
        <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
          ₹{item.total?.toFixed(2)}
        </div>
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Item Total
        </div>
      </div>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ status, date, description, active, icon, isCurrent = false, isFirst = false, isLast = false }) {
  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        {!isFirst && <div className={`w-0.5 h-6 ${active ? 'bg-gray-300' : 'bg-gray-200'}`}></div>}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-base ${
          active 
            ? 'bg-gray-800 text-white' 
            : 'bg-gray-200 text-gray-500'
        } ${isCurrent ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}>
          {icon}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 ${active ? 'bg-gray-300' : 'bg-gray-200'}`}></div>}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className={`font-semibold text-base ${active ? 'text-gray-900' : 'text-gray-500'}`}>
          {status}
        </div>
        {description && (
          <div className="text-sm text-gray-600 mt-1">
            {description}
          </div>
        )}
        <div className="text-sm text-gray-500 mt-2">
          {date ? new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Pending'}
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm font-medium mb-1">{label}</label>
      <p className="text-gray-900 font-semibold text-base break-words">
        {value || "Not available"}
      </p>
    </div>
  );
}

// Action Button Component
function ActionButton({ onClick, text, icon, disabled = false, loading = false, variant = "primary" }) {
  const baseClasses = "w-full p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <span className="text-base">
          {icon}
        </span>
      )}
      {text}
    </button>
  );
}