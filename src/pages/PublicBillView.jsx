import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBillPublic, approveBill, rejectBill, addAdvance } from "../api/api";

export default function PublicBillView() {
  const { token } = useParams();
  const [bill, setBill] = useState(null);
  const [advance, setAdvance] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    approve: false,
    reject: false,
    advance: false
  });

  useEffect(() => {
    load();
  }, [token]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBillPublic(token);
      setBill(res.data);
    } catch (err) {
      console.error("Error loading bill:", err);
      setError("Failed to load bill. Please check the link or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!bill?._id) return;
    
    try {
      setActionLoading(prev => ({ ...prev, approve: true }));
      await approveBill(bill._id);
      alert("Bill Approved Successfully!");
      await load(); // Reload to get updated status
    } catch (err) {
      console.error("Error approving bill:", err);
      alert("Failed to approve bill. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, approve: false }));
    }
  };

  const handleReject = async () => {
    if (!bill?._id) return;
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection");
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, reject: true }));
      await rejectBill(bill._id, { reason: rejectReason });
      alert("Bill Rejected Successfully!");
      setRejectReason("");
      await load(); // Reload to get updated status
    } catch (err) {
      console.error("Error rejecting bill:", err);
      alert("Failed to reject bill. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, reject: false }));
    }
  };

  const handleAddAdvance = async () => {
    if (!bill?._id) return;
    if (!advance || advance <= 0) {
      alert("Please enter a valid advance amount");
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, advance: true }));
      await addAdvance(bill._id, { amount: parseFloat(advance) });
      alert(`Advance Payment of ₹${advance} Added Successfully!`);
      setAdvance("");
      await load(); // Reload to get updated status
    } catch (err) {
      console.error("Error adding advance:", err);
      alert("Failed to add advance payment. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, advance: false }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to Load Bill</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={load}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No bill found
  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-500 text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Bill Not Found</h2>
          <p className="text-gray-600">The bill you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Bill Summary</h1>
          <div className="flex justify-between items-center mt-2">
            <span className="text-blue-100">Bill #{bill._id}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              bill.status === 'approved' ? 'bg-green-500' :
              bill.status === 'rejected' ? 'bg-red-500' :
              bill.status === 'pending' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {bill.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
          <div className="space-y-1">
            <div className="font-medium">{bill.customerSnapshot?.name || 'N/A'}</div>
            <div className="text-gray-600">{bill.customerSnapshot?.mobile || 'N/A'}</div>
            <div className="text-sm text-gray-500">{bill.customerSnapshot?.address || 'No address provided'}</div>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-3">Order Items</h3>
          <div className="space-y-3">
            {bill.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold">{it.productName}</div>
                  <div className="text-sm text-gray-600">
                    Qty: {it.quantity} × ₹{it.price?.toFixed(2)}
                  </div>
                </div>
                <div className="font-semibold">₹{it.total?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Grand Total:</span>
            <span className="text-blue-600">₹{bill.grandTotal?.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions - Only show if bill is pending */}
        {bill.status === 'pending' && (
          <div className="p-6 space-y-4">
            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={actionLoading.approve}
              className="w-full bg-green-600 text-white px-4 py-3 rounded font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading.approve ? 'Approving...' : 'Approve Bill'}
            </button>

            {/* Reject Section */}
            <div className="space-y-2">
              <textarea
                className="border w-full p-3 rounded resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={actionLoading.reject}
              />
              <button
                onClick={handleReject}
                disabled={actionLoading.reject || !rejectReason.trim()}
                className="w-full bg-red-600 text-white px-4 py-3 rounded font-semibold hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading.reject ? 'Rejecting...' : 'Reject Bill'}
              </button>
            </div>

            {/* Advance Payment Section */}
            <div className="space-y-2">
              <input
                type="number"
                className="border w-full p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Advance payment amount"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                disabled={actionLoading.advance}
                min="0"
                step="0.01"
              />
              <button
                onClick={handleAddAdvance}
                disabled={actionLoading.advance || !advance || advance <= 0}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading.advance ? 'Processing...' : 'Pay Advance'}
              </button>
            </div>
          </div>
        )}

        {/* Bill is already processed */}
        {bill.status !== 'pending' && (
          <div className="p-6 text-center">
            <div className={`text-lg font-semibold ${
              bill.status === 'approved' ? 'text-green-600' :
              bill.status === 'rejected' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              This bill has been {bill.status}
            </div>
            <p className="text-gray-500 mt-2">No further actions can be taken on this bill.</p>
          </div>
        )}
      </div>
    </div>
  );
}