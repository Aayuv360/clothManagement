import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ShoppingCart, UserPlus, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  onAddProduct: () => void;
  onCreateOrder: () => void;
  onAddCustomer: () => void;
  onInventoryReport: () => void;
}

export default function QuickActions({ 
  onAddProduct, 
  onCreateOrder, 
  onAddCustomer, 
  onInventoryReport 
}: QuickActionsProps) {
  const actions = [
    {
      title: "Add Product",
      description: "Add new saree to inventory",
      icon: Plus,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: onAddProduct
    },
    {
      title: "Create Order",
      description: "New customer order",
      icon: ShoppingCart,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      onClick: onCreateOrder
    },
    {
      title: "Add Customer",
      description: "Register new customer",
      icon: UserPlus,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: onAddCustomer
    },
    {
      title: "Inventory Report",
      description: "View stock summary",
      icon: BarChart3,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: onInventoryReport
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        
        return (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={action.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{action.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${action.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
