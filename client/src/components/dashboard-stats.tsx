import { ShoppingCart, DollarSign, Package, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    totalOrders: number;
    revenue: number;
    lowStockCount: number;
    totalCustomers: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+12% from last month",
      trendColor: "text-green-600"
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+8.2% from last week",
      trendColor: "text-green-600"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockCount,
      icon: Package,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "Needs attention",
      trendColor: "text-orange-600",
      trendIcon: AlertTriangle
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "+15 new this week",
      trendColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendIcon || TrendingUp;
        
        return (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className={`text-xs mt-1 flex items-center ${stat.trendColor}`}>
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${stat.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
