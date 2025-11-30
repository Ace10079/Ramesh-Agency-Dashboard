import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchProducts,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurementsByOrder,
} from "../api/api";

export default function Measurement() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const viewMode = searchParams.get("view");

  const [products, setProducts] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const [form, setForm] = useState({
    orderId: "",
    category: "",
    subCategory: "",
    style: "",
    productId: "",
    lengthInches: "",
    widthInches: "",
    seats: "",
    pieces: "",
  });

  const [calculations, setCalculations] = useState({
    meters: 0,
    panels: 0,
    totalMeters: 0,
    squareFeet: 0,
    trackFeet: 0,
    pricePerMeter: 0,
    totalPrice: 0,
  });

  // Load products
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetchProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load measurements
  const loadMeasurements = async () => {
    try {
      const res = await getMeasurementsByOrder(orderId);
      setMeasurements(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading measurements:", error);
      setMeasurements([]);
    }
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, orderId }));
    loadProducts();

    if (viewMode) {
      loadMeasurements();
    }
  }, [editId, orderId, viewMode]);

  // Frontend calculateValues (same as backend)
  const calculateValues = (data) => {
    const { category, subCategory, style, lengthInches, widthInches, seats, pieces } = data;

    let meters = 0;
    let panels = 0;
    let totalMeters = 0;
    let squareFeet = 0;
    let trackFeet = 0;

    // Convert to numbers
    const length = parseFloat(lengthInches) || 0;
    const width = parseFloat(widthInches) || 0;
    const numSeats = parseFloat(seats) || 0;
    const numPieces = parseFloat(pieces) || 0;

    // CURTAINS - CURTAINS
    if (category === "Curtains" && subCategory === "Curtains") {
      let lengthAddition = 12;

      if (style === "Pleated") {
        panels = Math.round(width / 20);
      } else if (style === "Eyelet") {
        panels = Math.round(width / 24);
      } else if (style === "Ripple Fold") {
        panels = Math.round(width / 22);
      } else if (style === "Top Fold") {
        lengthAddition = 20;
        panels = Math.round(width / 42);
      }

      meters = (length + lengthAddition) * 0.0254;
      totalMeters = meters * panels;
    }

    // CURTAINS - BLINDS
    else if (category === "Curtains" && subCategory === "Blinds") {
      squareFeet = (length * width) / 144;

      if (style === "Roman") {
        panels = width / 44;
      } else if (style === "Roller") {
        meters = (length + 10) * 0.0254;
        totalMeters = meters;
      }
    }

    // UPHOLSTERY
    else if (category === "Upholstery") {
      if (subCategory === "Sofa") {
        panels = numSeats;
        totalMeters = numSeats;
      } else if (subCategory === "Headboard") {
        squareFeet = (length * width) / 144;
        if (length > 0 && width > 0) {
          meters = (length + 30) * 0.0254;
          const fabricPanels = Math.round(width / 40);
          totalMeters = meters * fabricPanels;
        }
      } else if (subCategory === "Puffy") {
        panels = numPieces;
        totalMeters = numPieces;
      }
    }

    if (category === "Curtains") {
      trackFeet = width / 12;
    }

    return {
      meters: parseFloat(meters.toFixed(2)),
      panels: parseFloat(panels.toFixed(2)),
      totalMeters: parseFloat(totalMeters.toFixed(2)),
      squareFeet: parseFloat(squareFeet.toFixed(2)),
      trackFeet: parseFloat(trackFeet.toFixed(2)),
    };
  };

  // Update calculations
  useEffect(() => {
    // For Upholstery - Sofa and Puffy, we don't need dimensions
    if (form.category === "Upholstery" && (form.subCategory === "Sofa" || form.subCategory === "Puffy")) {
      if (form.seats || form.pieces) {
        const vals = calculateValues(form);
        const selectedProduct = products.find((p) => p._id === form.productId);
        const pricePerMeter = selectedProduct?.price || 0;

        let totalPrice = 0;
        if (form.subCategory === "Sofa") {
          totalPrice = (parseFloat(form.seats) || 0) * pricePerMeter;
        } else if (form.subCategory === "Puffy") {
          totalPrice = (parseFloat(form.pieces) || 0) * pricePerMeter;
        }

        setCalculations({ 
          ...vals, 
          pricePerMeter, 
          totalPrice: parseFloat(totalPrice.toFixed(2)) 
        });
      }
    }
    // For other categories, we need dimensions
    else if ((form.lengthInches && form.widthInches) || (form.category === "Upholstery" && form.subCategory === "Headboard")) {
      const vals = calculateValues(form);
      const selectedProduct = products.find((p) => p._id === form.productId);
      const pricePerMeter = selectedProduct?.price || 0;

      let totalPrice = 0;
      if (form.category === "Curtains") {
        totalPrice = vals.totalMeters * pricePerMeter;
      } else if (form.category === "Upholstery") {
        if (form.subCategory === "Headboard") {
          totalPrice = vals.squareFeet * pricePerMeter;
        }
      }

      setCalculations({ 
        ...vals, 
        pricePerMeter, 
        totalPrice: parseFloat(totalPrice.toFixed(2)) 
      });
    }
  }, [form, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { 
        subCategory: "", style: "", productId: "", lengthInches: "", widthInches: "", seats: "", pieces: "" 
      }),
      ...(name === "subCategory" && { 
        style: "", productId: "", lengthInches: "", widthInches: "", seats: "", pieces: "" 
      }),
      ...(name === "style" && { productId: "", lengthInches: "", widthInches: "" }),
      ...(name === "productId" && { lengthInches: "", widthInches: "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare form data based on category
      const formData = {
        orderId: form.orderId,
        productId: form.productId,
        category: form.category,
        subCategory: form.subCategory,
      };

      // Add style only for categories that need it
      if (form.category === "Curtains") {
        formData.style = form.style || "";
      } else {
        // For Upholstery, send a default style to satisfy validation
        formData.style = "Standard";
      }

      // Add fields based on category
      if (form.category === "Upholstery") {
        if (form.subCategory === "Sofa") {
          formData.seats = parseFloat(form.seats) || 0;
          formData.pieces = 0;
          formData.lengthInches = 0;
          formData.widthInches = 0;
        } else if (form.subCategory === "Puffy") {
          formData.pieces = parseFloat(form.pieces) || 0;
          formData.seats = 0;
          formData.lengthInches = 0;
          formData.widthInches = 0;
        } else if (form.subCategory === "Headboard") {
          formData.lengthInches = parseFloat(form.lengthInches) || 0;
          formData.widthInches = parseFloat(form.widthInches) || 0;
          formData.seats = 0;
          formData.pieces = 0;
        }
      } else {
        // For Curtains, always send dimensions
        formData.lengthInches = parseFloat(form.lengthInches) || 0;
        formData.widthInches = parseFloat(form.widthInches) || 0;
        formData.seats = 0;
        formData.pieces = 0;
      }

      console.log("Submitting measurement data:", formData);

      if (!editId) {
        await createMeasurement(formData);
        setForm({ 
          orderId, category: "", subCategory: "", style: "", productId: "", 
          lengthInches: "", widthInches: "", seats: "", pieces: "" 
        });
        setCalculations({ 
          meters: 0, panels: 0, totalMeters: 0, squareFeet: 0, trackFeet: 0, 
          pricePerMeter: 0, totalPrice: 0 
        });
        loadMeasurements();
        alert("Measurement added successfully!");
      } else {
        await updateMeasurement(editId, formData);
        navigate(`/admin/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
      console.error("Error response:", error.response?.data);
      alert(`Error saving measurement: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) return;
    try {
      await deleteMeasurement(measurementId);
      loadMeasurements();
    } catch (error) {
      console.error(error);
      alert("Error deleting measurement.");
    }
  };

  const handleEditMeasurement = (measurementId) => {
    navigate(`/admin/orders/${orderId}/measurement?edit=${measurementId}`);
  };

  // VIEW MODE
  if (viewMode) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Measurements for Order #{orderId?.slice(-8).toUpperCase()}
          </h2>
          <button 
            onClick={() => navigate(`/admin/orders/${orderId}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Order
          </button>
        </div>

        {measurements.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow text-center">
            <div className="text-6xl mb-4">📏</div>
            <h3 className="text-xl font-semibold">No Measurements</h3>
            <button 
              onClick={() => navigate(`/admin/orders/${orderId}/measurement`)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded"
            >
              Add First Measurement
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Style</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Calculations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Total Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {measurements.map((m) => (
                  <tr key={m._id}>
                    <td className="px-6 py-4">{m.productId?.productName}</td>
                    <td className="px-6 py-4">{m.category}</td>
                    <td className="px-6 py-4">{m.subCategory}</td>
                    <td className="px-6 py-4">{m.style}</td>
                    <td className="px-6 py-4">
                      {m.lengthInches > 0 && `${m.lengthInches}" × ${m.widthInches}"`}
                      {m.seats > 0 && ` | Seats: ${m.seats}`}
                      {m.pieces > 0 && ` | Pieces: ${m.pieces}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {m.panels > 0 && <div>Panels: {m.panels}</div>}
                        {m.meters > 0 && <div>Meters: {m.meters}m</div>}
                        {m.totalMeters > 0 && <div>Total Meters: {m.totalMeters}m</div>}
                        {m.squareFeet > 0 && <div>Area: {m.squareFeet} sq.ft</div>}
                        {m.trackFeet > 0 && <div>Track: {m.trackFeet} ft</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      ₹{(m.totalMeters * (m.productId?.price || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEditMeasurement(m._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeasurement(m._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-right">
          <button 
            onClick={() => navigate(`/admin/orders/${orderId}/measurement`)}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            ➕ Add New Measurement
          </button>
        </div>
      </div>
    );
  }

  // ADD/EDIT FORM
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {editId ? "Edit Measurement" : "Add Measurement"}
        </h2>
        <button 
          onClick={() => navigate(`/admin/orders/${orderId}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Order
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        {/* Category */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="Curtains">Curtains</option>
            <option value="Upholstery">Upholstery</option>
          </select>
        </div>

        {/* SubCategory */}
        {form.category && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Type *</label>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Type</option>
              {form.category === "Curtains" && (
                <>
                  <option value="Curtains">Curtains</option>
                  <option value="Blinds">Blinds</option>
                </>
              )}
              {form.category === "Upholstery" && (
                <>
                  <option value="Sofa">Sofa</option>
                  <option value="Headboard">Headboard</option>
                  <option value="Puffy">Puffy</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Style for Curtains */}
        {form.category === "Curtains" && form.subCategory === "Curtains" && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Style *</label>
            <select
              name="style"
              value={form.style}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Style</option>
              <option value="Pleated">Pleated</option>
              <option value="Eyelet">Eyelet</option>
              <option value="Ripple Fold">Ripple Fold</option>
              <option value="Top Fold">Top Fold</option>
            </select>
          </div>
        )}

        {/* Style for Blinds */}
        {form.category === "Curtains" && form.subCategory === "Blinds" && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Blind Type *</label>
            <select
              name="style"
              value={form.style}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Blind Type</option>
              <option value="Roman">Roman</option>
              <option value="Roller">Roller</option>
              <option value="Zebra">Zebra</option>
              <option value="PVC">PVC</option>
              <option value="Industrial Blinds">Industrial Blinds</option>
            </select>
          </div>
        )}

        {/* Upholstery Specific Fields */}
        {form.category === "Upholstery" && form.subCategory === "Sofa" && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Number of Seats *</label>
            <input
              type="number"
              name="seats"
              value={form.seats}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              placeholder="Enter number of seats"
            />
          </div>
        )}

        {form.category === "Upholstery" && form.subCategory === "Puffy" && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Number of Pieces *</label>
            <input
              type="number"
              name="pieces"
              value={form.pieces}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              placeholder="Enter number of pieces"
            />
          </div>
        )}

        {/* Product Selection */}
        {((form.category === "Curtains" && form.style) || 
          (form.category === "Upholstery" && form.subCategory) || 
          form.subCategory === "Blinds") && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Product *</label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">{productsLoading ? "Loading products..." : "Select Product"}</option>
              {!productsLoading && products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} - ₹{p.price} ({p.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dimensions - Show for categories that need dimensions */}
        {form.productId && 
         ((form.category === "Curtains") || 
          (form.category === "Upholstery" && form.subCategory === "Headboard")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Length (inches) *</label>
              <input
                type="number"
                name="lengthInches"
                value={form.lengthInches}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
                step="0.1"
                placeholder="Enter length"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Width (inches) *</label>
              <input
                type="number"
                name="widthInches"
                value={form.widthInches}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
                step="0.1"
                placeholder="Enter width"
              />
            </div>
          </div>
        )}

        {/* Calculations Display */}
        {(calculations.totalMeters > 0 || calculations.squareFeet > 0 || calculations.panels > 0) && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Calculations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {calculations.meters > 0 && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Meters</div>
                  <div className="font-semibold">{calculations.meters}m</div>
                </div>
              )}
              {calculations.panels > 0 && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Panels</div>
                  <div className="font-semibold">{calculations.panels}</div>
                </div>
              )}
              {calculations.totalMeters > 0 && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Total Meters</div>
                  <div className="font-semibold">{calculations.totalMeters}m</div>
                </div>
              )}
              {calculations.squareFeet > 0 && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Square Feet</div>
                  <div className="font-semibold">{calculations.squareFeet} sq.ft</div>
                </div>
              )}
              {calculations.trackFeet > 0 && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Track Required</div>
                  <div className="font-semibold">{calculations.trackFeet} ft</div>
                </div>
              )}
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Price per Meter</div>
                <div className="font-semibold">₹{calculations.pricePerMeter}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total Price</span>
                <span className="text-2xl font-bold text-green-600">₹{calculations.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !form.productId || 
              ((form.category === "Curtains" || (form.category === "Upholstery" && form.subCategory === "Headboard")) && 
               (!form.lengthInches || !form.widthInches)) ||
              (form.category === "Upholstery" && form.subCategory === "Sofa" && !form.seats) ||
              (form.category === "Upholstery" && form.subCategory === "Puffy" && !form.pieces)}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "Saving..." : editId ? "Update Measurement" : "Add Measurement"}
          </button>
          {!editId && (
            <button
              type="button"
              onClick={() => navigate(`/admin/orders/${orderId}`)}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded hover:bg-gray-700 font-semibold"
            >
              Finish
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate(`/admin/orders/${orderId}/measurement?view=true`)}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View All Measurements
        </button>
      </div>
    </div>
  );
}