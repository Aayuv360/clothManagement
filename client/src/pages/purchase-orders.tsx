import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Eye, Edit, Package, Calendar, DollarSign, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseOrder, Supplier } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const filteredPOs = purchaseOrders?.filter(po => {
    const supplier = suppliers?.find(s => s.id === po.supplierId);
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "ordered":
        return "bg-indigo-100 text-indigo-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
              <p className="text-sm text-gray-500">Manage purchase orders and supplier procurement</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
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

  const posByStatus = {
    all: filteredPOs || [],
    draft: filteredPOs?.filter(po => po.status === "draft") || [],
    pending: filteredPOs?.filter(po => po.status === "pending") || [],
    approved: filteredPOs?.filter(po => po.status === "approved") || [],
    ordered: filteredPOs?.filter(po => po.status === "ordered") || [],
    received: filteredPOs?.filter(po => po.status === "received") || [],
  };

  const totalPOs = filteredPOs?.length || 0;
  const pendingPOs = filteredPOs?.filter(po => po.status === "pending").length || 0;
  const totalValue = filteredPOs?.reduce((sum, po) => sum + parseFloat(po.total), 0) || 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
            <p className="text-sm text-gray-500">Manage purchase orders and supplier procurement</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Purchase Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total POs</p>
                  <p className="text-2xl font-bold text-gray-800">{totalPOs}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-800">{pendingPOs}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-yellow-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalValue.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-800">{suppliers?.filter(s => s.isActive).length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-purple-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search purchase orders..."
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
              <SelectItem value="all">All POs</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purchase Orders Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({posByStatus.all.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({posByStatus.draft.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({posByStatus.pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({posByStatus.approved.length})</TabsTrigger>
            <TabsTrigger value="ordered">Ordered ({posByStatus.ordered.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({posByStatus.received.length})</TabsTrigger>
          </TabsList>

          {Object.entries(posByStatus).map(([status, statusPOs]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {statusPOs.map((po) => {
                const supplier = suppliers?.find(s => s.id === po.supplierId);
                
                return (
                  <Card key={po.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(supplier?.name || 'Unknown')}`}>
                            <span className="text-sm font-medium">
                              {getInitials(supplier?.name || 'Unknown')}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{po.poNumber}</h3>
                            <p className="text-sm text-gray-500">{supplier?.name || 'Unknown Supplier'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(po.status)} capitalize`}>
                            {po.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg font-semibold">{formatCurrency(po.total)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created Date</p>
                          <p className="text-sm text-gray-800">
                            {po.createdAt && formatDistanceToNow(new Date(po.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expected Date</p>
                          <p className="text-sm text-gray-800">
                            {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Received Date</p>
                          <p className="text-sm text-gray-800">
                            {po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : "Not received"}
                          </p>
                        </div>
                      </div>

                      {po.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-sm text-gray-800">{po.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {statusPOs.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchase orders found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "No purchase orders match your search." : `No ${status === "all" ? "" : status} purchase orders yet.`}
                  </p>
                  {status === "all" && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Purchase Order
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}