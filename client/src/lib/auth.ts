import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["admin", "staff", "warehouse"]).default("staff"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Mock auth functions - in a real app, these would make API calls
export const authService = {
  login: async (credentials: LoginFormData): Promise<User> => {
    // TODO: Implement actual login API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === "admin" && credentials.password === "admin123") {
          resolve({
            id: 1,
            username: "admin",
            email: "admin@sareeflow.com",
            fullName: "Admin User",
            role: "admin",
            createdAt: new Date(),
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  },

  register: async (userData: RegisterFormData): Promise<User> => {
    // TODO: Implement actual registration API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          createdAt: new Date(),
        });
      }, 1000);
    });
  },

  logout: async (): Promise<void> => {
    // TODO: Implement actual logout API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    // TODO: Implement actual user fetch from storage/session
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock returning current user
        resolve({
          id: 1,
          username: "admin",
          email: "admin@sareeflow.com",
          fullName: "Admin User",
          role: "admin",
          createdAt: new Date(),
        });
      }, 500);
    });
  },
};

// Auth context hooks would be implemented here
export const useAuth = () => {
  // TODO: Implement actual auth context
  return {
    user: null,
    isLoading: false,
    error: null,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
  };
};
