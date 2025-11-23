import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="lg:ml-64 w-full p-4 lg:p-6 bg-gray-100 min-h-screen pt-16 lg:pt-6">
        {children}
      </div>
    </div>
  );
}