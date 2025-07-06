import { 
  users, customers, products, orders, orderItems, suppliers, inventoryMovements, purchaseOrders, purchaseOrderItems,
  type User, type InsertUser, type Customer, type InsertCustomer, type Product, type InsertProduct,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Supplier, type InsertSupplier,
  type InventoryMovement, type InsertInventoryMovement, type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderItem, type InsertPurchaseOrderItem, type OrderWithCustomer, type OrderWithItems,
  type OrderWithDetails, type ProductWithStock
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getLowStockProducts(): Promise<ProductWithStock[]>;
  
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<OrderWithCustomer[]>;
  getOrder(id: number): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithDetails>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getRecentOrders(limit: number): Promise<OrderWithCustomer[]>;
  
  // Inventory methods
  getInventoryMovements(): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  updateProductStock(productId: number, quantity: number, type: 'add' | 'subtract'): Promise<void>;
  
  // Purchase Order methods
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  
  // Dashboard methods
  getDashboardStats(): Promise<{
    totalOrders: number;
    revenue: number;
    lowStockCount: number;
    totalCustomers: number;
  }>;

  // GridFS Image Upload methods
  uploadSingleImage?(file: Express.Multer.File): Promise<string>;
  uploadMultipleImages?(files: Express.Multer.File[]): Promise<string[]>;
  getImage?(imageId: string): Promise<NodeJS.ReadableStream>;
  deleteImage?(imageId: string): Promise<boolean>;
  getImageUrl?(imageId: string): string;
  getMulterConfig?(): any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private customers: Map<number, Customer> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private inventoryMovements: Map<number, InventoryMovement> = new Map();
  private purchaseOrders: Map<number, PurchaseOrder> = new Map();
  private purchaseOrderItems: Map<number, PurchaseOrderItem> = new Map();
  
  private currentUserId = 1;
  private currentCustomerId = 1;
  private currentProductId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentSupplierId = 1;
  private currentInventoryMovementId = 1;
  private currentPurchaseOrderId = 1;
  private currentPurchaseOrderItemId = 1;

  constructor() {
    // Initialize with demo users for all roles
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@sareeflow.com",
      fullName: "Admin User",
      role: "admin"
    });
    
    this.createUser({
      username: "staff",
      password: "staff123",
      email: "staff@sareeflow.com",
      fullName: "Sales Staff",
      role: "staff"
    });
    
    this.createUser({
      username: "warehouse",
      password: "warehouse123",
      email: "warehouse@sareeflow.com",
      fullName: "Warehouse Manager",
      role: "warehouse"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      role: insertUser.role || 'staff',
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      id: this.currentProductId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getLowStockProducts(): Promise<ProductWithStock[]> {
    const products = Array.from(this.products.values());
    return products
      .filter(p => p.stockQuantity <= p.minStockLevel)
      .map(p => ({
        ...p,
        isLowStock: true,
        stockStatus: p.stockQuantity <= 2 ? 'critical' : p.stockQuantity <= 5 ? 'low' : 'medium'
      }));
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      ...insertCustomer,
      id: this.currentCustomerId++,
      totalOrders: 0,
      totalSpent: "0",
      createdAt: new Date(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer: Customer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const supplier: Supplier = {
      ...insertSupplier,
      id: this.currentSupplierId++,
      createdAt: new Date(),
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  async updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier: Supplier = { ...supplier, ...updates };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Order methods
  async getOrders(): Promise<OrderWithCustomer[]> {
    const orders = Array.from(this.orders.values());
    return orders.map(order => ({
      ...order,
      customer: this.customers.get(order.customerId)!
    }));
  }

  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const customer = this.customers.get(order.customerId);
    if (!customer) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId)!
      }));
    
    return {
      ...order,
      customer,
      items
    };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithDetails> {
    const order: Order = {
      ...insertOrder,
      id: this.currentOrderId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);
    
    // Create order items
    const orderItemsWithIds = items.map(item => ({
      ...item,
      id: this.currentOrderItemId++,
      orderId: order.id
    }));
    
    orderItemsWithIds.forEach(item => {
      this.orderItems.set(item.id, item);
      // Update product stock
      this.updateProductStock(item.productId, item.quantity, 'subtract');
    });
    
    // Update customer totals
    const customer = this.customers.get(order.customerId);
    if (customer) {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (parseFloat(customer.totalSpent || "0") + parseFloat(order.total)).toString();
    }
    
    return {
      ...order,
      customer: customer!,
      items: orderItemsWithIds.map(item => ({
        ...item,
        product: this.products.get(item.productId)!
      }))
    };
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      ...updates,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  async getRecentOrders(limit: number): Promise<OrderWithCustomer[]> {
    const orders = Array.from(this.orders.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    
    return orders.map(order => ({
      ...order,
      customer: this.customers.get(order.customerId)!
    }));
  }

  // Inventory methods
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    return Array.from(this.inventoryMovements.values());
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const movement: InventoryMovement = {
      ...insertMovement,
      id: this.currentInventoryMovementId++,
      createdAt: new Date(),
    };
    this.inventoryMovements.set(movement.id, movement);
    return movement;
  }

  async updateProductStock(productId: number, quantity: number, type: 'add' | 'subtract'): Promise<void> {
    const product = this.products.get(productId);
    if (!product) return;
    
    const newQuantity = type === 'add' 
      ? product.stockQuantity + quantity 
      : product.stockQuantity - quantity;
    
    product.stockQuantity = Math.max(0, newQuantity);
    product.updatedAt = new Date();
    
    // Record inventory movement
    await this.createInventoryMovement({
      productId,
      type: type === 'add' ? 'purchase' : 'sale',
      quantity: type === 'add' ? quantity : -quantity,
      reference: `Stock ${type === 'add' ? 'addition' : 'reduction'}`,
      notes: `Automatic stock update`
    });
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertPO: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
    const po: PurchaseOrder = {
      ...insertPO,
      id: this.currentPurchaseOrderId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.purchaseOrders.set(po.id, po);
    
    // Create purchase order items
    items.forEach(item => {
      const poItem: PurchaseOrderItem = {
        ...item,
        id: this.currentPurchaseOrderItemId++,
        purchaseOrderId: po.id
      };
      this.purchaseOrderItems.set(poItem.id, poItem);
    });
    
    return po;
  }

  async updatePurchaseOrder(id: number, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const po = this.purchaseOrders.get(id);
    if (!po) return undefined;
    
    const updatedPO: PurchaseOrder = {
      ...po,
      ...updates,
      updatedAt: new Date(),
    };
    this.purchaseOrders.set(id, updatedPO);
    return updatedPO;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<{
    totalOrders: number;
    revenue: number;
    lowStockCount: number;
    totalCustomers: number;
  }> {
    const orders = Array.from(this.orders.values());
    const products = Array.from(this.products.values());
    const customers = Array.from(this.customers.values());
    
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;
    const totalCustomers = customers.length;
    
    return {
      totalOrders,
      revenue,
      lowStockCount,
      totalCustomers
    };
  }
}

export let storage: IStorage = new MemStorage();

export function setStorage(newStorage: IStorage) {
  storage = newStorage;
}
