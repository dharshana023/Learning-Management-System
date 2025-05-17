import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Define the user type
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Check for token in localStorage
  const getToken = () => localStorage.getItem("authToken");
  
  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("authToken");
            return null;
          }
          throw new Error("Failed to fetch user data");
        }
        
        return response.json();
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Handle login
  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };
  
  // Handle logout
  const logout = () => {
    localStorage.removeItem("authToken");
    queryClient.invalidateQueries();
    navigate("/login");
  };
  
  // Determine if user is authenticated
  const isAuthenticated = !!user;
  
  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

// Hook to protect routes
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

// Hook to check if user is admin
export function useIsAdmin() {
  const { user, isLoading } = useAuth();
  return {
    isAdmin: user?.role === "admin",
    isLoading,
  };
}