import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchProducts, updateProduct } from "../../api/api";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProducts();
        const prod = res.data.find((p) => p._id === id);
        if (!prod) {
          alert("Product not found");
          navigate("/admin/products");
          return;
        }
        const formData = {
          productName: prod.productName || "",
          price: prod.price || "",
          unit: prod.unit || "pcs",
          category: prod.category || "Curtains",
          description: prod.description || "",
        };
        setForm(formData);
        setOriginalForm(formData);
      } catch (err) {
        console.error(err);
        alert("Error loading product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.productName?.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!form.price || Number(form.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!form.unit) {
      newErrors.unit = "Unit is required";
    }

    if (!form.category?.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await updateProduct(id, { 
        ...form, 
        price: Number(form.price) 
      });
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFormChanged = () => {
    if (!originalForm || !form) return false;
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  };

  const categories = [
    "Curtains",
    "Sofa Cover",
    "Bedsheet",
    "Pillow Cover",
    "Tracks",
    "Accessories"
  ];

  const units = [
    { value: "pcs", label: "Pieces" },
    { value: "mtrs", label: "Meters" },
    { value: "roll", label: "Roll" },
    { value: "set", label: "Set" },
    { value: "box", label: "Box" },
    { value: "custom", label: "Custom" }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout>
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're trying to edit doesn't exist.</p>
          <Link
            to="/admin/products"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 inline-block"
          >
            Back to Products
          </Link>
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
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/admin/products"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 group"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                  Back to Products
                </Link>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Edit Product</h1>
              <div className="w-20 h-1 bg-gray-800 rounded-full mb-2"></div>
              <p className="text-gray-600">
                Update product information and pricing
              </p>
            </div>
            <div className="text-4xl lg:text-6xl opacity-20 transform hover:scale-110 transition-transform duration-300">
              ✏️
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white text-gray-900 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className={`w-full bg-gray-50 border ${
                  errors.productName ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300`}
              />
              {errors.productName && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.productName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border ${
                    errors.unit ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300`}
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.unit}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full bg-gray-50 border ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 p-3 lg:p-4 rounded-lg pl-8 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300`}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
                <span className="text-gray-500 text-xs ml-1">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                rows="4"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || !isFormChanged()}
                className="flex-1 bg-gray-900 text-white p-3 lg:p-4 rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-base lg:text-lg flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Update Product
                  </>
                )}
              </button>
              
              <Link
                to="/admin/products"
                className="flex-1 bg-gray-200 text-gray-900 p-3 lg:p-4 rounded-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2 border border-gray-300"
              >
                <span>↶</span>
                Cancel
              </Link>
            </div>

            {!isFormChanged() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg">💡</span>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">No Changes Made</p>
                    <p className="text-yellow-600 text-xs mt-1">
                      Modify any field above to enable the update button.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}