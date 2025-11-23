import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts, createBill } from "../../api/api";

export default function CreateOrder() {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setProductsLoading(true);
        const res = await fetchProducts();
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = (product) => {
    const existingIndex = selectedItems.findIndex(
      item => item.productId === product._id
    );

    if (existingIndex > -1) {
      setSelectedItems(prev => {
        const copy = [...prev];
        const item = copy[existingIndex];
        const newQty = item.quantity + 1;

        copy[existingIndex] = {
          ...item,
          quantity: newQty,
          total: newQty * item.price,
        };

        return copy;
      });
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          productId: product._id,
          productName: product.productName,
          quantity: 1,
          price: product.price,
          total: product.price,
          unit: product.unit,
        }
      ]);
    }
  };

  const handleRemove = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ FIXED quantity update
  const updateItem = (index, value) => {
    setSelectedItems(prev => {
      const copy = [...prev];
      
      // allow empty value while typing
      const quantity = value === "" ? "" : Number(value);

      copy[index] = {
        ...copy[index],
        quantity: quantity,
        total:
          quantity === ""
            ? 0
            : quantity * copy[index].price,
      };

      return copy;
    });
  };

  const fixQuantityOnBlur = (index) => {
    setSelectedItems(prev => {
      const copy = [...prev];
      let quantity = copy[index].quantity;

      if (!quantity || quantity < 1) quantity = 1;

      copy[index] = {
        ...copy[index],
        quantity,
        total: quantity * copy[index].price,
      };

      return copy;
    });
  };

  const grandTotal = selectedItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );

  const totalItems = selectedItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const handleSave = async () => {
    if (selectedItems.length === 0) {
      alert("Please add at least one product to create an order");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      };

      const res = await createBill(payload);
      navigate(`/admin/bills/${res.data.bill._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h1 className="text-2xl font-bold">Create New Order</h1>
          <p className="text-gray-600">Add products and create bill</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* PRODUCTS */}
          <div className="xl:col-span-2 bg-white p-4 rounded-xl border shadow">

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full mb-4 p-3 border rounded-lg"
            />

            {productsLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAdd={handleAdd}
                    isAdded={selectedItems.some(item => item.productId === product._id)}
                  />
                ))}
              </div>
            )}

          </div>

          {/* SUMMARY */}
          <div className="bg-white p-4 rounded-xl border shadow sticky top-6">

            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {selectedItems.length === 0 ? (
                <p className="text-center text-gray-600">No items added</p>
              ) : (
                selectedItems.map((item, index) => (
                  <OrderItem
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={updateItem}
                    onBlurFix={fixQuantityOnBlur}
                    onRemove={handleRemove}
                  />
                ))
              )}
            </div>

            <div className="border-t mt-4 pt-4">
              <p>Total Items: {totalItems}</p>
              <p>Products: {selectedItems.length}</p>
              <h2 className="text-xl font-bold mt-2">
                Grand Total: ₹{grandTotal.toFixed(2)}
              </h2>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-4 bg-black text-white p-3 rounded-lg"
            >
              {loading ? "Creating..." : "Save & Generate Bill"}
            </button>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

// PRODUCT CARD
function ProductCard({ product, onAdd, isAdded }) {
  return (
    <div className="border p-4 rounded-lg">
      <h4 className="font-semibold">{product.productName}</h4>
      <p>{product.unit}</p>
      <p className="font-bold">₹{product.price}</p>

      <button
        onClick={() => onAdd(product)}
        className="w-full mt-2 bg-gray-900 text-white py-2 rounded"
      >
        {isAdded ? "✅ Added" : "➕ Add"}
      </button>
    </div>
  );
}

// ORDER ITEM ✅ FIXED INPUT
function OrderItem({ item, index, onUpdate, onBlurFix, onRemove }) {
  return (
    <div className="border p-3 rounded-lg">

      <div className="flex justify-between mb-2">
        <h4 className="font-semibold">{item.productName}</h4>
        <button onClick={() => onRemove(index)}>🗑️</button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <label>Qty:</label>
        <input
          type="number"
          value={item.quantity}
          min="1"
          onChange={e => onUpdate(index, e.target.value)}
          onBlur={() => onBlurFix(index)}
          className="border p-1 w-20 rounded"
        />
      </div>

      <p>Unit: ₹{item.price}</p>
      <p>Total: ₹{item.total.toFixed(2)}</p>

    </div>
  );
}
