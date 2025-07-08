import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Eye, Edit, Package, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddOrderModal from "@/components/add-order-modal";
import OrderDetailsModal from "@/components/order-details-modal";
import { OrderWithCustomer } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Orders() {
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/orders"],
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "packed":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "cod":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "confirmed":
      case "packed":
        return Package;
      case "shipped":
        return Package;
      case "delivered":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600'
    ];
    return colors[name.length % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
              <p className="text-sm text-gray-500">Manage customer orders and track deliveries</p>
            </div>
            <Button onClick={() => setShowAddOrderModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const ordersByStatus = {
    all: filteredOrders || [],
    pending: filteredOrders?.filter(o => o.status === "pending") || [],
    confirmed: filteredOrders?.filter(o => o.status === "confirmed") || [],
    shipped: filteredOrders?.filter(o => o.status === "shipped") || [],
    delivered: filteredOrders?.filter(o => o.status === "delivered") || [],
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
              <p className="text-sm text-gray-500">Manage customer orders and track deliveries</p>
            </div>
            <Button onClick={() => setShowAddOrderModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({ordersByStatus.all.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({ordersByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({ordersByStatus.confirmed.length})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({ordersByStatus.shipped.length})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({ordersByStatus.delivered.length})</TabsTrigger>
            </TabsList>

            {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {statusOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  
                  return (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(order.customer.name)}`}>
                              <span className="text-sm font-medium">
                                {getInitials(order.customer.name)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{order.orderNumber}</h3>
                              <p className="text-sm text-gray-500">{order.customer.name} • {order.customer.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getStatusColor(order.status)} capitalize flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {order.status}
                            </Badge>
                            <Badge className={`${getPaymentStatusColor(order.paymentStatus)} capitalize`}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="text-sm text-gray-800">
                              {order.createdAt && formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Delivery Date</p>
                            <p className="text-sm text-gray-800">
                              {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tracking</p>
                            <p className="text-sm text-gray-800">
                              {order.trackingNumber || "Not available"}
                            </p>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-sm text-gray-800">{order.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setShowOrderDetailsModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setShowOrderDetailsModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {statusOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? "No orders match your search." : `No ${status === "all" ? "" : status} orders yet.`}
                    </p>
                    {status === "all" && (
                      <Button onClick={() => setShowAddOrderModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Order
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>

      <AddOrderModal 
        open={showAddOrderModal} 
        onClose={() => setShowAddOrderModal(false)} 
      />
      
      <OrderDetailsModal 
        open={showOrderDetailsModal} 
        onClose={() => {
          setShowOrderDetailsModal(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />
    </>
  );
}
