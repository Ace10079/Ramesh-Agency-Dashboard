import AdminLayout from "../../layout/AdminLayout";
import { useEffect, useState } from "react";
import { fetchCustomers } from "../../api/api";
import { Link } from "react-router-dom";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchCustomers();
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Customer Management</h1>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full mb-2"></div>
              <p className="text-gray-600 text-sm lg:text-base">
                Manage your customer database and view customer details
              </p>
            </div>
            <div className="text-4xl lg:text-6xl opacity-20 transform hover:scale-110 transition-transform duration-300">
              👥
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredAndSortedCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {searchTerm ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by adding your first customer"}
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span>📋</span>
                    Customer List
                    <span className="text-sm text-gray-600 font-normal ml-2">
                      ({filteredAndSortedCustomers.length} customers)
                    </span>
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 w-full sm:w-64"
                    />
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="recent">Sort by Recent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                <div className="space-y-3 p-4">
                  {filteredAndSortedCustomers.map((customer) => (
                    <MobileCustomerCard
                      key={customer._id}
                      customer={customer}
                      getInitials={getInitials}
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
                        Customer
                      </th>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Contact
                      </th>
                      <th className="py-4 px-4 lg:px-6 text-left text-gray-700 font-semibold text-sm">
                        Address
                      </th>
                     
                      <th className="py-4 px-4 lg:px-6 text-center text-gray-700 font-semibold text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedCustomers.map((customer, index) => (
                      <CustomerRow
                        key={customer._id}
                        customer={customer}
                        index={index}
                        getInitials={getInitials}
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

// Customer Row Component for Desktop
function CustomerRow({ customer, index, getInitials }) {
  return (
    <tr 
      className="hover:bg-gray-50 transition-all duration-200 group"
    >
      <td className="py-4 px-4 lg:px-6">
        <Link
          to={`/admin/customers/${customer._id}`}
          className="flex items-center gap-3 group-hover:text-gray-900 transition-colors duration-200"
        >
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(customer.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {customer.name}
            </div>
            <div className="text-xs text-gray-500">ID: {customer._id?.slice(-8) || 'N/A'}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 lg:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-900 truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-900">{customer.mobile || 'Not provided'}</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 lg:px-6">
        <div className="max-w-xs">
          <div className="text-gray-900 text-sm line-clamp-2">
            {customer.address || "Not provided"}
          </div>
        </div>
      </td>
     
      <td className="py-4 px-4 lg:px-6">
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/customers/${customer._id}`}
            className="text-gray-600  hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            title="View Details"
          >
          View
          </Link>
          <Link
            to={`/admin/customers/${customer._id}/create-order`}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            title="Create Order"
          >
            Order
          </Link>
         
        </div>
      </td>
    </tr>
  );
}

// Mobile Customer Card Component
function MobileCustomerCard({ customer, getInitials }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(customer.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
            <p className="text-xs text-gray-500">ID: {customer._id?.slice(-8) || 'N/A'}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs border border-gray-300">
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          Active
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-900 truncate flex-1">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-900">{customer.mobile || 'Not provided'}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-900 flex-1">{customer.address || "Not provided"}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <Link
          to={`/admin/customers/${customer._id}`}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100"
        >
          👁️ View
        </Link>
        <Link
          to={`/admin/customers/${customer._id}/create-order`}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100"
        >
          🛒 Order
        </Link>
       
      </div>
    </div>
  );
}