import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { IStorage } from "./storage";
import { GridFSUploadService } from "./gridfs-upload";
import {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Customer,
  InsertCustomer,
  Supplier,
  InsertSupplier,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  InventoryMovement,
  InsertInventoryMovement,
  PurchaseOrder,
  InsertPurchaseOrder,
  PurchaseOrderItem,
  InsertPurchaseOrderItem,
  OrderWithCustomer,
  OrderWithDetails,
  ProductWithStock,
} from "@shared/schema";

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db!: Db;
  private gridFSUpload!: GridFSUploadService;
  private users!: Collection;
  private products!: Collection;
  private customers!: Collection;
  private suppliers!: Collection;
  private orders!: Collection;
  private orderItems!: Collection;
  private inventoryMovements!: Collection;
  private purchaseOrders!: Collection;
  private purchaseOrderItems!: Collection;

  constructor(uri: string) {
    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      tls: true,
      tlsInsecure: false,
      family: 4, // Force IPv4
    });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("MongoDB client connected successfully");
      this.db = this.client.db("clothbusiness");

      // Initialize GridFS upload service
      this.gridFSUpload = new GridFSUploadService(this.db);

      // Initialize collections with sm_ prefix
      this.users = this.db.collection("sm_users");
      this.products = this.db.collection("sm_products");
      this.customers = this.db.collection("sm_customers");
      this.suppliers = this.db.collection("sm_suppliers");
      this.orders = this.db.collection("sm_orders");
      this.orderItems = this.db.collection("sm_order_items");
      this.inventoryMovements = this.db.collection("sm_inventory_movements");
      this.purchaseOrders = this.db.collection("sm_purchase_orders");
      this.purchaseOrderItems = this.db.collection("sm_purchase_order_items");

      // Create indexes for better performance
      await this.users.createIndex({ username: 1 }, { unique: true });
      await this.products.createIndex({ sku: 1 }, { unique: true });
      await this.customers.createIndex({ phone: 1 });
      await this.orders.createIndex({ orderNumber: 1 }, { unique: true });

      // Seed demo users if they don't exist
      await this.seedDemoUsers();
      console.log("MongoDB setup completed");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error;
    }
  }

  private async seedDemoUsers() {
    const existingAdmin = await this.users.findOne({ username: "admin" });
    if (!existingAdmin) {
      await this.users.insertMany([
        {
          username: "admin",
          password: "admin123",
          email: "admin@sareeflow.com",
          fullName: "Admin User",
          role: "admin",
          createdAt: new Date(),
        },
        {
          username: "staff",
          password: "staff123",
          email: "staff@sareeflow.com",
          fullName: "Sales Staff",
          role: "staff",
          createdAt: new Date(),
        },
        {
          username: "warehouse",
          password: "warehouse123",
          email: "warehouse@sareeflow.com",
          fullName: "Warehouse Manager",
          role: "warehouse",
          createdAt: new Date(),
        },
      ]);
    }
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.users.findOne({ id });
    return user ? this.convertFromMongo(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.users.findOne({ username });
    return user ? this.convertFromMongo(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = {
      ...insertUser,
      id: this.generateId(),
      createdAt: new Date(),
    };
    await this.users.insertOne(user);
    return this.convertFromMongo(user);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    const products = await this.products.find({}).toArray();
    return products.map((p) => this.convertFromMongo(p));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const product = await this.products.findOne({ id });
    return product ? this.convertFromMongo(product) : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product = {
      ...insertProduct,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      sizes: insertProduct.sizes || null,
      description: insertProduct.description || null,
      costPrice: insertProduct.costPrice || null,
      colors: insertProduct.colors || null,
      fabric: insertProduct.fabric || null,
      images: insertProduct.images || null,
      isActive: insertProduct.isActive ?? true,
    };
    await this.products.insertOne(product);
    return this.convertFromMongo(product);
  }

  async updateProduct(
    id: number,
    updates: Partial<InsertProduct>,
  ): Promise<Product | undefined> {
    const updatedProduct = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await this.products.findOneAndUpdate(
      { id },
      { $set: updatedProduct },
      { returnDocument: "after" },
    );

    return result ? this.convertFromMongo(result) : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.products.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async getLowStockProducts(): Promise<ProductWithStock[]> {
    const products = await this.products.find({}).toArray();
    return products
      .map((p) => this.convertFromMongo(p))
      .filter((p) => p.stockQuantity <= p.minStockLevel)
      .map((p) => ({
        ...p,
        isLowStock: p.stockQuantity <= p.minStockLevel,
        stockStatus:
          p.stockQuantity === 0
            ? ("critical" as const)
            : p.stockQuantity <= p.minStockLevel * 0.5
              ? ("critical" as const)
              : p.stockQuantity <= p.minStockLevel
                ? ("low" as const)
                : ("good" as const),
      }));
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    const customers = await this.customers.find({}).toArray();
    return customers.map((c) => this.convertFromMongo(c));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const customer = await this.customers.findOne({ id });
    return customer ? this.convertFromMongo(customer) : undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer = {
      ...insertCustomer,
      id: this.generateId(),
      totalOrders: 0,
      totalSpent: "0",
      createdAt: new Date(),
      email: insertCustomer.email || null,
      address: insertCustomer.address || null,
      city: insertCustomer.city || null,
      state: insertCustomer.state || null,
      pincode: insertCustomer.pincode || null,
      gstNumber: insertCustomer.gstNumber || null,
      preferences: insertCustomer.preferences || null,
      notes: insertCustomer.notes || null,
    };
    await this.customers.insertOne(customer);
    return this.convertFromMongo(customer);
  }

  async updateCustomer(
    id: number,
    updates: Partial<InsertCustomer>,
  ): Promise<Customer | undefined> {
    const result = await this.customers.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" },
    );
    return result ? this.convertFromMongo(result) : undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await this.customers.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.suppliers.find({}).toArray();
    return suppliers.map((s) => this.convertFromMongo(s));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const supplier = await this.suppliers.findOne({ id });
    return supplier ? this.convertFromMongo(supplier) : undefined;
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const supplier = {
      ...insertSupplier,
      id: this.generateId(),
      createdAt: new Date(),
      contactPerson: insertSupplier.contactPerson || null,
      email: insertSupplier.email || null,
      address: insertSupplier.address || null,
      city: insertSupplier.city || null,
      state: insertSupplier.state || null,
      pincode: insertSupplier.pincode || null,
      gstNumber: insertSupplier.gstNumber || null,
      bankDetails: insertSupplier.bankDetails || null,
      paymentTerms: insertSupplier.paymentTerms || null,
      notes: insertSupplier.notes || null,
      isActive: insertSupplier.isActive ?? true,
    };
    await this.suppliers.insertOne(supplier);
    return this.convertFromMongo(supplier);
  }

  async updateSupplier(
    id: number,
    updates: Partial<InsertSupplier>,
  ): Promise<Supplier | undefined> {
    const result = await this.suppliers.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" },
    );
    return result ? this.convertFromMongo(result) : undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await this.suppliers.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Order methods
  async getOrders(): Promise<OrderWithCustomer[]> {
    const orders = await this.orders.find({}).toArray();
    const result = [];

    for (const order of orders) {
      const customer = await this.customers.findOne({ id: order.customerId });
      if (customer) {
        result.push({
          ...this.convertFromMongo(order),
          customer: this.convertFromMongo(customer),
        });
      }
    }

    return result;
  }

  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const order = await this.orders.findOne({ id });
    if (!order) return undefined;

    const customer = await this.customers.findOne({ id: order.customerId });
    const items = await this.orderItems.find({ orderId: id }).toArray();

    const itemsWithProducts = [];
    for (const item of items) {
      const product = await this.products.findOne({ id: item.productId });
      if (product) {
        itemsWithProducts.push({
          ...this.convertFromMongo(item),
          product: this.convertFromMongo(product),
        });
      }
    }

    if (!customer) return undefined;

    return {
      ...this.convertFromMongo(order),
      customer: this.convertFromMongo(customer),
      items: itemsWithProducts,
    };
  }

  async createOrder(
    insertOrder: InsertOrder,
    items: InsertOrderItem[],
  ): Promise<OrderWithDetails> {
    const orderId = this.generateId();

    const order = {
      ...insertOrder,
      id: orderId,
      status: insertOrder.status || "pending",
      paymentStatus: insertOrder.paymentStatus || "pending",
      discount: insertOrder.discount || null,
      tax: insertOrder.tax || null,
      shippingAddress: insertOrder.shippingAddress || null,
      billingAddress: insertOrder.billingAddress || null,
      notes: insertOrder.notes || null,
      orderDate: insertOrder.orderDate || new Date(),
      deliveryDate: insertOrder.deliveryDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.orders.insertOne(order);

    const orderItems = items.map((item) => ({
      ...item,
      id: this.generateId(),
      orderId,
    }));

    await this.orderItems.insertMany(orderItems);

    // Update product stock
    for (const item of items) {
      await this.updateProductStock(item.productId, item.quantity, "subtract");
    }

    return (await this.getOrder(orderId)) as OrderWithDetails;
  }

  async updateOrder(
    id: number,
    updates: Partial<InsertOrder>,
  ): Promise<Order | undefined> {
    const updatedOrder = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await this.orders.findOneAndUpdate(
      { id },
      { $set: updatedOrder },
      { returnDocument: "after" },
    );

    return result ? this.convertFromMongo(result) : undefined;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await this.orders.deleteOne({ id });
    await this.orderItems.deleteMany({ orderId: id });
    return result.deletedCount === 1;
  }

  async getRecentOrders(limit: number): Promise<OrderWithCustomer[]> {
    const orders = await this.orders
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const result = [];
    for (const order of orders) {
      const customer = await this.customers.findOne({ id: order.customerId });
      if (customer) {
        result.push({
          ...this.convertFromMongo(order),
          customer: this.convertFromMongo(customer),
        });
      }
    }

    return result;
  }

  // Inventory methods
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    const movements = await this.inventoryMovements.find({}).toArray();
    return movements.map((m) => this.convertFromMongo(m));
  }

  async createInventoryMovement(
    insertMovement: InsertInventoryMovement,
  ): Promise<InventoryMovement> {
    const movement = {
      ...insertMovement,
      id: this.generateId(),
      notes: insertMovement.notes || null,
      reference: insertMovement.reference || null,
      createdAt: new Date(),
    };
    await this.inventoryMovements.insertOne(movement);
    return this.convertFromMongo(movement);
  }

  async updateProductStock(
    productId: number,
    quantity: number,
    type: "add" | "subtract",
  ): Promise<void> {
    const product = await this.products.findOne({ id: productId });
    if (!product) return;

    const newQuantity =
      type === "add"
        ? product.stockQuantity + quantity
        : product.stockQuantity - quantity;

    await this.products.updateOne(
      { id: productId },
      {
        $set: {
          stockQuantity: Math.max(0, newQuantity),
          updatedAt: new Date(),
        },
      },
    );

    // Create inventory movement record
    await this.createInventoryMovement({
      productId,
      type: type === "add" ? "stock_in" : "stock_out",
      quantity: type === "add" ? quantity : -quantity,
      notes: `Stock ${type === "add" ? "added" : "removed"} via system`,
    });
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const pos = await this.purchaseOrders.find({}).toArray();
    return pos.map((po) => this.convertFromMongo(po));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const po = await this.purchaseOrders.findOne({ id });
    return po ? this.convertFromMongo(po) : undefined;
  }

  async createPurchaseOrder(
    insertPO: InsertPurchaseOrder,
    items: InsertPurchaseOrderItem[],
  ): Promise<PurchaseOrder> {
    const poId = this.generateId();

    const po = {
      ...insertPO,
      id: poId,
      status: insertPO.status || "pending",
      tax: insertPO.tax || null,
      notes: insertPO.notes || null,
      expectedDate: insertPO.expectedDate || null,
      receivedDate: insertPO.receivedDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.purchaseOrders.insertOne(po);

    const poItems = items.map((item) => ({
      ...item,
      id: this.generateId(),
      purchaseOrderId: poId,
    }));

    await this.purchaseOrderItems.insertMany(poItems);
    return this.convertFromMongo(po);
  }

  async updatePurchaseOrder(
    id: number,
    updates: Partial<InsertPurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {
    const updatedPO = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await this.purchaseOrders.findOneAndUpdate(
      { id },
      { $set: updatedPO },
      { returnDocument: "after" },
    );

    return result ? this.convertFromMongo(result) : undefined;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<{
    totalOrders: number;
    revenue: number;
    lowStockCount: number;
    totalCustomers: number;
  }> {
    const totalOrders = await this.orders.countDocuments();
    const totalCustomers = await this.customers.countDocuments();

    const orders = await this.orders.find({}).toArray();
    const revenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total || "0"),
      0,
    );

    const lowStockProducts = await this.getLowStockProducts();

    return {
      totalOrders,
      revenue,
      lowStockCount: lowStockProducts.length,
      totalCustomers,
    };
  }

  private convertFromMongo(doc: any): any {
    if (!doc) return doc;

    // Remove MongoDB's _id field and return the document
    const { _id, ...result } = doc;
    return result;
  }

  // GridFS upload methods
  async uploadSingleImage(file: Express.Multer.File): Promise<string> {
    return this.gridFSUpload.uploadSingleImage(file);
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    return this.gridFSUpload.uploadMultipleImages(files);
  }

  async getImage(imageId: string): Promise<NodeJS.ReadableStream> {
    return this.gridFSUpload.getImage(imageId);
  }

  async deleteImage(imageId: string): Promise<boolean> {
    return this.gridFSUpload.deleteImage(imageId);
  }

  getImageUrl(imageId: string): string {
    return this.gridFSUpload.getImageUrl(imageId);
  }

  getMulterConfig() {
    return this.gridFSUpload.getMulterConfig();
  }

  async disconnect() {
    await this.client.close();
  }
}
