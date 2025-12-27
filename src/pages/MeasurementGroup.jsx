import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { printMeasurementBill } from "../utils/printMeasurementBill";
import { createMeasurementBill, fetchSingleOrder, getMeasurementGroupsByOrder, getMeasurementsByOrder, createMeasurementGroup, deleteMeasurement } from "../api/api";
import { motion } from "framer-motion";

export default function MeasurementGroup() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const selectedGroupId = searchParams.get("groupId");

  const loadGroupsAndMeasurements = async () => {
    try {
      setLoading(true);

      const resGroups = await getMeasurementGroupsByOrder(orderId);
      const groupsData = resGroups.data || [];
      setGroups(groupsData);

      const resMeasurements = await getMeasurementsByOrder(orderId);
      const byGroup = {};
      resMeasurements.data.forEach((m) => {
        if (!byGroup[m.groupId]) byGroup[m.groupId] = [];
        byGroup[m.groupId].push(m);
      });
      setMeasurements(byGroup);

    } catch (err) {
      console.error("Error loading measurement groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupsAndMeasurements();
  }, [orderId]);

  const handleAddGroup = async () => {
    try {
      setLoading(true);
      await createMeasurementGroup(orderId);
      await loadGroupsAndMeasurements();
    } catch (err) {
      console.error("Error creating new group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeasurementItem = async (measurementId) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) return;
    try {
      await deleteMeasurement(measurementId);
      await loadGroupsAndMeasurements();
    } catch (err) {
      console.error(err);
      alert("Error deleting measurement");
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Measurement Groups</h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Print Bill - Hidden on mobile, shown on sm+ */}
          <button
            onClick={async () => {
              const orderRes = await fetchSingleOrder(orderId);
              printMeasurementBill({
                shop: {
                  name: "Your Shop Name",
                  address: "Your Shop Address",
                  phone: "9XXXXXXXXX"
                },
                order: orderRes.data,
                measurements
              });
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">🧾 Print Bill</span>
            <span className="sm:hidden">🧾 Print</span>
          </button>

          {/* Create Measurement Bill - Hidden on mobile, shown on md+ */}
          <button
            onClick={async () => {
              try {
                const allMeasurementIds = Object.values(measurements).flat().map(m => m._id);
                if (allMeasurementIds.length === 0) {
                  alert("No measurements to bill");
                  return;
                }

                const orderRes = await fetchSingleOrder(orderId);
                const order = orderRes.data;

                const res = await createMeasurementBill({
                  orderId,
                  customerId: order.customerId,
                  measurementIds: allMeasurementIds
                });

                navigate(`/admin/measurement-bill/${res.data.bill._id}`);
              } catch (err) {
                console.error("Failed to create or fetch measurement bill", err);
                alert("Failed to create measurement bill");
              }
            }}
            className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base"
          >
            <span className="hidden md:inline">Create Measurement Bill</span>
            <span className="md:hidden">Create Bill</span>
          </button>

          {/* Add New Group */}
          <button
            onClick={handleAddGroup}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Add New Group</span>
            <span className="sm:hidden">+ Group</span>
          </button>
        </div>
      </div>

      {groups.length === 0 && <p className="text-center py-4">No measurement groups found</p>}

      {/* Groups List */}
      <div className="space-y-4">
        {groups.map((group, index) => {
          const groupMeasurements = measurements[group._id] || [];
          const totalMeters = groupMeasurements.reduce((sum, m) => sum + (m.totalMeters || 0), 0);
          const totalSqFt = groupMeasurements.reduce((sum, m) => sum + (m.squareFeet || 0), 0);
          const totalPrice = groupMeasurements.reduce(
            (sum, m) => sum + ((m.productId?.price || 0) * (m.totalMeters || m.squareFeet || 1)), 0
          );

          return (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg border border-gray-200"
            >
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Group {group.groupNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {groupMeasurements.length} item{groupMeasurements.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/orders/${orderId}/measurement?groupId=${group._id}`)
                    }
                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition text-sm w-full sm:w-auto"
                  >
                    Add Measurement
                  </button>
                 
                </div>
              </div>

              {/* Measurements Display */}
              {groupMeasurements.length > 0 ? (
                <>
                  {/* Mobile Cards View */}
                  <div className="md:hidden space-y-3">
                    {groupMeasurements.map((m) => (
                      <div key={m._id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{m.productId?.name || m.subCategory}</h4>
                            <p className="text-sm text-gray-500">{m.category} • {m.subCategory}</p>
                            {m.style && <p className="text-sm text-gray-500">Style: {m.style}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/admin/orders/${orderId}/measurement?groupId=${group._id}&edit=${m._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMeasurementItem(m._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Dimensions:</span>
                            <span className="ml-2">{m.lengthInches || "-"}×{m.widthInches || "-"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Meters:</span>
                            <span className="ml-2">{m.totalMeters || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sq Ft:</span>
                            <span className="ml-2">{m.squareFeet || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="ml-2">
                              ₹{((m.productId?.price || 0) * (m.totalMeters || m.squareFeet || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-auto border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 border">Product</th>
                          <th className="px-4 py-2 border">Category</th>
                          <th className="px-4 py-2 border">Type</th>
                          <th className="px-4 py-2 border">Style</th>
                          <th className="px-4 py-2 border">Length (in)</th>
                          <th className="px-4 py-2 border">Width (in)</th>
                          <th className="px-4 py-2 border">Meters</th>
                          <th className="px-4 py-2 border">Sq Ft</th>
                          <th className="px-4 py-2 border">Price</th>
                          <th className="px-4 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupMeasurements.map((m) => (
                          <tr key={m._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{m.productId?.name || m.subCategory}</td>
                            <td className="px-4 py-2 border">{m.category}</td>
                            <td className="px-4 py-2 border">{m.subCategory}</td>
                            <td className="px-4 py-2 border">{m.style || "-"}</td>
                            <td className="px-4 py-2 border">{m.lengthInches || "-"}</td>
                            <td className="px-4 py-2 border">{m.widthInches || "-"}</td>
                            <td className="px-4 py-2 border">{m.totalMeters || 0}</td>
                            <td className="px-4 py-2 border">{m.squareFeet || 0}</td>
                            <td className="px-4 py-2 border">
                              ₹{((m.productId?.price || 0) * (m.totalMeters || m.squareFeet || 1)).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 border space-x-2">
                              <button
                                onClick={() => navigate(`/admin/orders/${orderId}/measurement?groupId=${group._id}&edit=${m._id}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMeasurementItem(m._id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="font-semibold bg-gray-100">
                          <td className="px-4 py-2 border text-right" colSpan={6}>Total:</td>
                          <td className="px-4 py-2 border">{totalMeters.toFixed(2)}</td>
                          <td className="px-4 py-2 border">{totalSqFt.toFixed(2)}</td>
                          <td className="px-4 py-2 border">₹{totalPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 border"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Totals */}
                  <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Total Meters</div>
                        <div className="font-semibold">{totalMeters.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Total Sq Ft</div>
                        <div className="font-semibold">{totalSqFt.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Total Price</div>
                        <div className="font-semibold">₹{totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No measurements yet for this group.</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}