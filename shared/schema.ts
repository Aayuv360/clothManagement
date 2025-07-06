import { z } from "zod";

// User interfaces and schemas
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(["admin", "staff", "warehouse"]).default("staff"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Product interfaces and schemas
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  price: string;
  costPrice: string | null;
  stockQuantity: number;
  minStockLevel: number;
  color: string | null;
  size: string | null;
  fabric: string | null;
  imageUrl: string | null;
  images: string[] | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const insertProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.string().min(1),
  costPrice: z.string().optional(),
  stockQuantity: z.number().int().min(0),
  minStockLevel: z.number().int().min(0),
  color: z.string().optional(),
  size: z.string().optional(),
  fabric: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

// Customer interfaces and schemas
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
  preferences: string | null;
  notes: string | null;
  totalOrders: number | null;
  totalSpent: string | null;
  createdAt: Date | null;
}

export const insertCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Supplier interfaces and schemas
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
  bankDetails: string | null;
  paymentTerms: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export const insertSupplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  bankDetails: z.string().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

// Order interfaces and schemas
export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string | null;
  discount: string | null;
  total: string;
  notes: string | null;
  orderDate: Date | null;
  deliveryDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const insertOrderSchema = z.object({
  orderNumber: z.string().min(1),
  customerId: z.number().int().positive(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
  paymentStatus: z.enum(["paid", "partial", "cod", "pending"]).default("pending"),
  subtotal: z.string().min(1),
  tax: z.string().optional(),
  discount: z.string().optional(),
  total: z.string().min(1),
  notes: z.string().optional(),
  orderDate: z.date().optional(),
  deliveryDate: z.date().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order Item interfaces and schemas
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  total: string;
}

export const insertOrderItemSchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.string().min(1),
  total: z.string().min(1),
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Inventory Movement interfaces and schemas
export interface InventoryMovement {
  id: number;
  productId: number;
  type: string;
  quantity: number;
  notes: string | null;
  reference: string | null;
  createdAt: Date | null;
}

export const insertInventoryMovementSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().int(),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;

// Purchase Order interfaces and schemas
export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  status: string;
  subtotal: string;
  tax: string | null;
  total: string;
  notes: string | null;
  expectedDate: Date | null;
  receivedDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const insertPurchaseOrderSchema = z.object({
  poNumber: z.string().min(1),
  supplierId: z.number().int().positive(),
  status: z.enum(["pending", "sent", "received", "cancelled"]).default("pending"),
  subtotal: z.string().min(1),
  tax: z.string().optional(),
  total: z.string().min(1),
  notes: z.string().optional(),
  expectedDate: z.date().optional(),
  receivedDate: z.date().optional(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

// Purchase Order Item interfaces and schemas
export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  price: string;
  total: string;
}

export const insertPurchaseOrderItemSchema = z.object({
  purchaseOrderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.string().min(1),
  total: z.string().min(1),
});

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

// Extended types for complex queries
export type OrderWithCustomer = Order & { customer: Customer };
export type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };
export type OrderWithDetails = Order & { 
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};
export type ProductWithStock = Product & { 
  isLowStock: boolean;
  stockStatus: 'critical' | 'low' | 'medium' | 'good';
};