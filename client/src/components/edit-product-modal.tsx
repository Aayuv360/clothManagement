import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { insertProductSchema, Product } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  costPrice: z.string().optional(),
  stockQuantity: z.string().min(1, "Stock quantity is required"),
  minStockLevel: z.string().min(1, "Minimum stock level is required"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(product.imageUrl ? [product.imageUrl] : []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      category: product.category,
      price: product.price,
      costPrice: product.costPrice || "",
      stockQuantity: product.stockQuantity.toString(),
      minStockLevel: product.minStockLevel.toString(),
      fabric: product.fabric || "",
      color: product.color || "",
      size: product.size || "",
      isActive: product.isActive ?? true,
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        category: product.category,
        price: product.price,
        costPrice: product.costPrice || "",
        stockQuantity: product.stockQuantity.toString(),
        minStockLevel: product.minStockLevel.toString(),
        fabric: product.fabric || "",
        color: product.color || "",
        size: product.size || "",
        isActive: product.isActive ?? true,
      });
      setImages(product.imageUrl ? [product.imageUrl] : []);
    }
  }, [product, form]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const productData = {
        ...data,
        price: data.price,
        costPrice: data.costPrice || "0",
        stockQuantity: parseInt(data.stockQuantity),
        minStockLevel: parseInt(data.minStockLevel),
        imageUrl: images.length > 0 ? images[0] : null,
      };
      
      return await apiRequest("PUT", `/api/products/${product.id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stock-alerts"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: ProductFormValues) => {
    updateProductMutation.mutate(data);
  };

  const handleImageUpload = (urls: string[]) => {
    setImages(urls);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="silk">Silk Sarees</SelectItem>
                        <SelectItem value="cotton">Cotton Sarees</SelectItem>
                        <SelectItem value="chiffon">Chiffon Sarees</SelectItem>
                        <SelectItem value="georgette">Georgette Sarees</SelectItem>
                        <SelectItem value="kanchipuram">Kanchipuram Sarees</SelectItem>
                        <SelectItem value="banarasi">Banarasi Sarees</SelectItem>
                        <SelectItem value="designer">Designer Sarees</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fabric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fabric</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter fabric type" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cost price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter stock quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter minimum stock level" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      rows={3} 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ImageUpload 
              onUpload={handleImageUpload}
              existing={images}
              maxFiles={5}
              className="space-y-2"
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}