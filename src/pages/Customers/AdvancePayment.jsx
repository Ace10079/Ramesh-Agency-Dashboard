import AdminLayout from "../../layout/AdminLayout";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addAdvance } from "../../api/api";

export default function AdvancePayment() {
  const { id } = useParams(); // customerId
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    if (!amount || amount <= 0) return alert("Enter valid amount");

    try {
      await addAdvance(id, { amount });
      alert("Advance payment added");
      navigate(`/admin/customers/${id}/approve`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-3">Advance Payment</h2>

      <div className="bg-white p-4 rounded shadow">
        <label className="block mb-2 font-semibold">Enter Advance Amount</label>

        <input
          type="number"
          className="border p-2 w-full rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹0.00"
        />

        <button
          onClick={handleSubmit}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Advance
        </button>
      </div>
    </AdminLayout>
  );
}
