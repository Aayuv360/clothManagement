import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductWithStock } from "@shared/schema";

interface StockAlertsProps {
  alerts: ProductWithStock[];
}

export default function StockAlerts({ alerts }: StockAlertsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertBgColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "low":
        return "bg-yellow-50 border-yellow-200";
      case "medium":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStockMessage = (product: ProductWithStock) => {
    const remaining = product.stockQuantity;
    if (remaining <= 2) {
      return `Only ${remaining} left in stock`;
    } else if (remaining <= 5) {
      return `${remaining} left in stock`;
    } else {
      return `${remaining} left in stock`;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Stock Alerts</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Items running low on stock</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No stock alerts at the moment</p>
            </div>
          ) : (
            alerts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border ${getAlertBgColor(product.stockStatus)}`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  <p className={`text-xs mt-1 ${
                    product.stockStatus === 'critical' ? 'text-red-600' :
                    product.stockStatus === 'low' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {getStockMessage(product)}
                  </p>
                </div>
                <Badge className={`${getStatusColor(product.stockStatus)} capitalize`}>
                  {product.stockStatus}
                </Badge>
              </div>
            ))
          )}
        </div>
        {alerts.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-sm text-primary hover:text-blue-700 font-medium"
          >
            View All Stock Alerts
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
