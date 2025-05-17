import { LoginForm } from "@/components/auth/LoginForm";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Helmet>
        <title>Login - Learning Tracker</title>
        <meta name="description" content="Login to your account to continue your learning journey." />
      </Helmet>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue learning</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}