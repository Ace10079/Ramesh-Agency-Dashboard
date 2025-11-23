import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBill, approveBill } from "../../api/api";

export default function ApproveBill() {
  const { id } = useParams(); // customerId
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await fetchBill(id);
      setBill(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!bill)
    return <AdminLayout><div>Loading...</div></AdminLayout>;

  const handleApprove = async () => {
    try {
      await approveBill(bill._id);
      alert("Bill Approved!");
      navigate(`/admin/customers/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-3">Approve Bill</h2>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Bill Total: ₹{bill.grandTotal}</div>

        {bill.items.map((it, idx) => (
          <div key={idx} className="border-b py-2 flex justify-between">
            <div>{it.productName}</div>
            <div>₹{it.total}</div>
          </div>
        ))}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve
          </button>

          <button
            onClick={() => navigate(`/admin/customers/${id}/reject`)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>

          <button
            onClick={() => navigate(`/admin/customers/${id}/advance`)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Advance Payment
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
