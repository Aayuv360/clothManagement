import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Inventory from "@/pages/inventory";
import Orders from "@/pages/orders";
import Customers from "@/pages/customers";
import Suppliers from "@/pages/suppliers";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Sidebar from "@/components/sidebar";

function MainRouter() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/orders" component={Orders} />
          <Route path="/customers" component={Customers} />
          <Route path="/suppliers" component={Suppliers} />
          <Route path="/billing" component={Billing} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
