import AdminLayout from "../../layout/AdminLayout";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rejectBill } from "../../api/api";

export default function RejectBill() {
  const { id } = useParams(); // customerId
  const navigate = useNavigate();
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Enter a reason");

    try {
      await rejectBill(id, { reason });
      alert("Bill rejected & sent back to admin");
      navigate(`/admin/customers/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-3">Reject Bill</h2>

      <div className="bg-white p-4 rounded shadow">
        <label className="block mb-2 font-semibold">Reason for rejection</label>

        <textarea
          className="border p-2 w-full rounded"
          rows="5"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why the bill is rejected"
        />

        <button
          onClick={handleSubmit}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
        >
          Submit Rejection
        </button>
      </div>
    </AdminLayout>
  );
}
