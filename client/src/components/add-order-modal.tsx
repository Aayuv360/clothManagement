import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Trash2 } from "lucide-react";
import { insertOrderSchema, type Customer, type Product } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const orderFormSchema = insertOrderSchema.extend({
  subtotal: z.string(),
  discount: z.string(),
  tax: z.string(),
  total: z.string(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderItem {
  productId: number;
  product?: Product;
  quantity: number;
  price: string;
  total: string;
}

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddOrderModal({ open, onClose }: AddOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: open,
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderNumber: `ORD-${Date.now()}`,
      customerId: 0,
      status: "pending",
      paymentStatus: "pending",
      subtotal: "0",
      discount: "0",
      tax: "0",
      total: "0",
      shippingAddress: "",
      billingAddress: "",
      notes: "",
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const orderData = {
        ...data,
        customerId: Number(data.customerId),
      };
      
      return await apiRequest("POST", "/api/orders", {
        order: orderData,
        items: orderItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-orders"] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      onClose();
      form.reset();
      setOrderItems([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    }
  });

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      productId: 0,
      quantity: 1,
      price: "0",
      total: "0"
    }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    calculateTotals();
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products?.find(p => p.id === value);
      if (product) {
        updatedItems[index].product = product;
        updatedItems[index].price = product.price;
        updatedItems[index].total = (parseFloat(product.price) * updatedItems[index].quantity).toString();
      }
    }
    
    if (field === 'quantity' || field === 'price') {
      const price = parseFloat(updatedItems[index].price);
      const quantity = updatedItems[index].quantity;
      updatedItems[index].total = (price * quantity).toString();
    }
    
    setOrderItems(updatedItems);
    calculateTotals();
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const discount = parseFloat(form.getValues('discount')) || 0;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal - discount + tax;
    
    form.setValue('subtotal', subtotal.toString());
    form.setValue('tax', tax.toString());
    form.setValue('total', total.toString());
  };

  const handleSubmit = (data: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Create New Order</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Button type="button" onClick={addOrderItem} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
              
              {orderItems.map((item, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(value) => updateOrderItem(index, 'productId', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - ₹{product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                        <Input value={item.total} readOnly />
                      </div>
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {orderItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <Input value={form.watch('subtotal')} readOnly />
              </div>
              
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          calculateTotals();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (18%)</label>
                <Input value={form.watch('tax')} readOnly />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <Input value={form.watch('total')} readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Address</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
