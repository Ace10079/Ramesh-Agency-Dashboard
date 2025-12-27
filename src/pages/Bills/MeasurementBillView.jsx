import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layout/AdminLayout";
import { fetchMeasurementBill } from "../../api/api";

export default function MeasurementBillView() {
  const { id } = useParams();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBill = async () => {
      try {
        const res = await fetchMeasurementBill(id);
        setBill(res.data);
      } catch (error) {
        console.error("Failed to fetch measurement bill", error);
      } finally {
        setLoading(false);
      }
    };
    loadBill();
  }, [id]);

  if (loading) return <AdminLayout>Loading...</AdminLayout>;
  if (!bill) return <AdminLayout>Bill not found</AdminLayout>;

  const publicLink = `${window.location.origin.replace(/:\d+$/, ":5174")}/measurement-bill/${bill.billLinkToken}`;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <div className="bg-white p-6 rounded shadow flex justify-between items-center border-b">
          <div>
            <h1 className="text-2xl font-bold">Measurement Bill</h1>
            <p className="text-sm text-gray-600">Bill ID: {bill._id}</p>
            <p className="mt-1">
              Status:{" "}
              <span className="px-2 py-1 rounded bg-gray-100 font-semibold">
                {bill.status}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(publicLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {copied ? "Copied!" : "Copy Customer Link"}
          </button>
        </div>

        {/* ================= CUSTOMER ================= */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">
            Customer Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><b>Name:</b> {bill.customerSnapshot.name}</p>
            <p><b>Mobile:</b> {bill.customerSnapshot.mobile}</p>
            <p className="col-span-2">
              <b>Address:</b> {bill.customerSnapshot.address}
            </p>
          </div>
        </div>

        {/* ================= ITEMS TABLE ================= */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">
            Measurement Details
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">#</th>
                  <th className="border px-3 py-2 text-left">Item</th>
                  <th className="border px-3 py-2">Meters</th>
                  <th className="border px-3 py-2">Sq Ft</th>
                  <th className="border px-3 py-2">Rate</th>
                  <th className="border px-3 py-2">Amount</th>
                </tr>
              </thead>

              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-3 py-2">
                      <div className="font-semibold">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.category} {item.subCategory && `- ${item.subCategory}`}
                      </div>
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {item.totalMeters || "-"}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {item.squareFeet || "-"}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      ₹{item.price?.toFixed(2)}
                    </td>
                    <td className="border px-3 py-2 text-right font-semibold">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= TOTAL ================= */}
        <div className="bg-white p-6 rounded shadow flex justify-between text-lg font-bold">
          <span>Grand Total</span>
          <span>₹{bill.grandTotal.toFixed(2)}</span>
        </div>

      </div>
    </AdminLayout>
  );
}
