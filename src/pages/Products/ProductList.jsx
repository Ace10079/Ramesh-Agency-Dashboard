import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { fetchProducts, deleteProduct } from "../../api/api";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
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
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Product Management</h1>
              <div className="w-20 h-1 bg-gray-800 rounded-full mb-2"></div>
              <p className="text-gray-600">
                Manage your product inventory and pricing
              </p>
            </div>
            <div className="text-4xl lg:text-6xl opacity-20 transform hover:scale-110 transition-transform duration-300">
              📦
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white text-gray-900 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 lg:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== "all").map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <Link
                to="/admin/products/add"
                className="bg-gray-900 text-white px-4 lg:px-6 py-3 rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2 justify-center"
              >
                <span>➕</span>
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {searchTerm || categoryFilter !== 'all' ? '🔍' : '📦'}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {searchTerm || categoryFilter !== 'all' 
                  ? "No products found" 
                  : "No products yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all'
                  ? "Try adjusting your search or filter terms"
                  : "Start by adding your first product to the inventory"}
              </p>
              <Link
                to="/admin/products/add"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 inline-block"
              >
                Add First Product
              </Link>
            </div>
          ) : (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>📋</span>
                  Product List
                  <span className="text-sm text-gray-600 font-normal ml-2">
                    ({filteredProducts.length} products)
                  </span>
                </h3>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                <div className="space-y-4 p-4">
                  {filteredProducts.map((product) => (
                    <MobileProductCard
                      key={product._id}
                      product={product}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Product
                      </th>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Price
                      </th>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Unit
                      </th>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Category
                      </th>
                     
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        index={index}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Product Row Component for Desktop
function ProductRow({ product, index, onDelete, deletingId }) {
  return (
    <tr className="hover:bg-gray-50 transition-all duration-200 group">
      <td className="py-4 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm lg:text-lg">
            {product.productName?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {product.productName}
            </div>
            <div className="text-xs text-gray-500">ID: {product._id?.slice(-8) || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 lg:px-6">
        <div className="text-lg font-bold text-gray-900">
          ₹{product.price}
        </div>
      </td>
      <td className="py-4 px-4 lg:px-6">
        <div className="text-gray-900 text-sm">
          {product.unit || 'Piece'}
        </div>
      </td>
      <td className="py-4 px-4 lg:px-6">
        {product.category && (
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-300">
            {product.category}
          </span>
        )}
      </td>
     
      <td className="py-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/products/edit/${product._id}`}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            title="Edit Product"
          >
            ✏️
          </Link>
          <button
            onClick={() => onDelete(product._id)}
            disabled={deletingId === product._id}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Product"
          >
            {deletingId === product._id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              '🗑️'
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

// Mobile Product Card Component
function MobileProductCard({ product, onDelete, deletingId }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {product.productName?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.productName}</h3>
            <p className="text-xs text-gray-500">ID: {product._id?.slice(-8) || 'N/A'}</p>
          </div>
        </div>
        {product.category && (
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium border border-gray-300">
            {product.category}
          </span>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Price:</span>
          <span className="font-bold text-gray-900">₹{product.price}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Unit:</span>
          <span className="text-gray-900">{product.unit || 'Piece'}</span>
        </div>
       
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <Link
          to={`/admin/products/edit/${product._id}`}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100"
        >
          ✏️ Edit
        </Link>
        <button
          onClick={() => onDelete(product._id)}
          disabled={deletingId === product._id}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingId === product._id ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
              Deleting...
            </>
          ) : (
            '🗑️ Delete'
          )}
        </button>
      </div>
    </div>
  );
}