import { useState } from "react";

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all duration-300"
        >
          <span className="text-lg">☰</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        w-64 h-screen bg-white text-gray-900 p-5 fixed left-0 top-0 shadow-2xl border-r border-gray-300
        transform transition-transform duration-300 ease-in-out z-40
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close Button for Mobile */}
        <div className="lg:hidden flex justify-end mb-4">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all duration-300"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>

        {/* Logo/Header Section */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full mt-2"></div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          
          <NavItem href="/admin/customers" icon="👥" text="Customers" onClick={() => setIsMobileOpen(false)} />
          <NavItem href="/admin/products" icon="📦" text="Products" onClick={() => setIsMobileOpen(false)} />
          <NavItem href="/admin/orders" icon="🛒" text="Orders" onClick={() => setIsMobileOpen(false)} />
        </nav>

        {/* User Profile/Footer */}
        <div className="absolute bottom-5 left-5 right-5 p-3 bg-gray-100 rounded-lg border border-gray-300 transform hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable NavItem component with animations
function NavItem({ href, icon, text, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-200 hover:translate-x-2 border-l-4 border-transparent hover:border-gray-700 hover:shadow-lg"
    >
      <span className="text-lg transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </span>
      <span className="font-medium group-hover:text-gray-800 transition-colors duration-300">
        {text}
      </span>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}