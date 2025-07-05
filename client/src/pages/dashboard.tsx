import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStats from "@/components/dashboard-stats";
import RecentOrders from "@/components/recent-orders";
import StockAlerts from "@/components/stock-alerts";
import QuickActions from "@/components/quick-actions";
import AddProductModal from "@/components/add-product-modal";
import AddOrderModal from "@/components/add-order-modal";
import AddCustomerModal from "@/components/add-customer-modal";

export default function Dashboard() {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-orders"],
  });

  const { data: stockAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/dashboard/stock-alerts"],
  });

  const handleInventoryReport = () => {
    // Navigate to inventory page or show report modal
    console.log("Show inventory report");
  };

  if (statsLoading || ordersLoading || alertsLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  3
                </span>
              </Button>
              <Button onClick={() => setShowAddOrderModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {stockAlerts?.length || 0}
                </span>
              </Button>
              <Button onClick={() => setShowAddOrderModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <DashboardStats stats={stats || { totalOrders: 0, revenue: 0, lowStockCount: 0, totalCustomers: 0 }} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentOrders orders={recentOrders || []} />
            <StockAlerts alerts={stockAlerts || []} />
          </div>

          <QuickActions
            onAddProduct={() => setShowAddProductModal(true)}
            onCreateOrder={() => setShowAddOrderModal(true)}
            onAddCustomer={() => setShowAddCustomerModal(true)}
            onInventoryReport={handleInventoryReport}
          />
        </main>
      </div>

      <AddProductModal 
        open={showAddProductModal} 
        onClose={() => setShowAddProductModal(false)} 
      />
      
      <AddOrderModal 
        open={showAddOrderModal} 
        onClose={() => setShowAddOrderModal(false)} 
      />
      
      <AddCustomerModal 
        open={showAddCustomerModal} 
        onClose={() => setShowAddCustomerModal(false)} 
      />
    </>
  );
}
