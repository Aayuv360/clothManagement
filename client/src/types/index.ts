// Common types used across the application
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalOrders: number;
  revenue: number;
  lowStockCount: number;
  totalCustomers: number;
}

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'low' | 'medium';
  image?: string;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface ReportData {
  period: string;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  growth: number;
}

export interface InventoryReport {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  topProducts: Array<{
    id: number;
    name: string;
    sold: number;
    revenue: number;
  }>;
}

export interface CustomerReport {
  totalCustomers: number;
  activeCustomers: number;
  avgSpent: number;
  topCustomers: Array<{
    id: number;
    name: string;
    totalSpent: number;
    totalOrders: number;
  }>;
}

// Form validation schemas
export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: string;
  costPrice?: string;
  stockQuantity: string;
  minStockLevel: string;
  fabric?: string;
  colors?: string[];
  sizes?: string[];
  images?: string[];
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  preferences?: string;
  notes?: string;
}

export interface OrderFormData {
  orderNumber: string;
  customerId: number;
  status: string;
  paymentStatus: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

export interface SupplierFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  bankDetails?: string;
  paymentTerms?: string;
  notes?: string;
}

// UI Component Props
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface ActionMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  [key: string]: number | string;
}

// Notification types
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// File upload types
export interface FileUploadData {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
}

// Search and filter types
export interface SearchFilters {
  query: string;
  category?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Permission and role types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Export common enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  COD = 'cod',
}

export enum ProductCategory {
  SILK = 'silk',
  COTTON = 'cotton',
  DESIGNER = 'designer',
  FESTIVE = 'festive',
  CASUAL = 'casual',
  WEDDING = 'wedding',
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  WAREHOUSE = 'warehouse',
}

export enum StockStatus {
  GOOD = 'good',
  MEDIUM = 'medium',
  LOW = 'low',
  CRITICAL = 'critical',
  OUT_OF_STOCK = 'out_of_stock',
}
