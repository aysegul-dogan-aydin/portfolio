"use client";

import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Admin Panel
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href="/admin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/nodes"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Nodes
                  </a>
                  <a
                    href="/"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    View Site
                  </a>
                  <button
                    onClick={() => {
                      localStorage.removeItem("admin_authenticated");
                      window.location.href = "/admin/auth";
                    }}
                    className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </AdminAuthGuard>
    </ConvexClientProvider>
  );
}
