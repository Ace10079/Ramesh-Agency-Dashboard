import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBill } from "../../api/api";

export default function BillView() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchBill(id);
        setBill(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const billLink = bill ? `${window.location.origin.replace(
    /:\d+$/,
    ":5173"
  )}/bill/${bill.billLinkToken}` : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(billLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-gray-800 text-white';
      case 'pending': return 'bg-gray-400 text-gray-900';
      case 'cancelled': return 'bg-gray-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
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

  if (!bill) {
    return (
      <AdminLayout>
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-2">Bill Not Found</h2>
          <p className="text-gray-600 mb-6">The requested bill could not be loaded.</p>
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
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">📄</div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold">Bill #{bill._id?.slice(-8).toUpperCase()}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(bill.status)}`}>
                      {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="w-20 h-1 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 mt-3">Bill Details & Summary</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyToClipboard}
                className="bg-gray-900 text-white px-4 lg:px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 justify-center min-w-[140px]"
              >
                <span>
                  {copied ? '✅' : '📋'}
                </span>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <a
                href={billLink}
                target="_blank"
                rel="noreferrer"
                className="bg-gray-800 text-white px-4 lg:px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 justify-center min-w-[140px]"
              >
                <span>👁️</span>
                View Customer Page
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">👤</span>
                Customer Details
              </h3>
              
              <div className="space-y-5">
                <InfoItem 
                  label="Full Name" 
                  value={bill.customerSnapshot?.name}
                />
                <InfoItem 
                  label="Mobile Number" 
                  value={bill.customerSnapshot?.mobile}
                />
                <InfoItem 
                  label="Delivery Address" 
                  value={bill.customerSnapshot?.address}
                />
              </div>
            </div>

            {/* Bill Information */}
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                Bill Information
              </h3>
              
              <div className="space-y-5">
                <InfoItem 
                  label="Bill Date" 
                  value={new Date(bill.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                />
                <InfoItem 
                  label="Total Items" 
                  value={bill.items?.length}
                />
                <InfoItem 
                  label="Bill Token" 
                  value={bill.billLinkToken?.slice(0, 8) + "..."}
                />
                <InfoItem 
                  label="Bill Status" 
                  value={bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1).toLowerCase()}
                />
              </div>
            </div>
          </div>

          {/* Bill Items */}
          <div className="lg:col-span-2">
            <div className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    Order Items
                    <div className="text-sm text-gray-600 font-normal mt-1">
                      {bill.items?.length || 0} items in this bill
                    </div>
                  </div>
                </h3>
              </div>

              <div className="space-y-4">
                {bill.items?.map((item, idx) => (
                  <BillItem 
                    key={idx}
                    item={item}
                    index={idx}
                  />
                ))}
              </div>

              {/* Grand Total */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-lg">Grand Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{bill.grandTotal?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Reusable Bill Item Component
function BillItem({ item, index }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
      <div className="flex items-start gap-4 flex-1">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-lg text-sm font-semibold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base mb-1">
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

// Reusable Info Item Component
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm font-medium mb-1">{label}</label>
      <p className="text-gray-900 font-semibold text-base break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}