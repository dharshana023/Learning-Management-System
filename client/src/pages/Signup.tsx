import { SignupForm } from "@/components/auth/SignupForm";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Signup() {
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
        <title>Create Account - Learning Tracker</title>
        <meta name="description" content="Create a new account to start your learning journey with our comprehensive courses." />
      </Helmet>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Learning Platform</h1>
          <p className="text-gray-600">Create an account to start learning</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
}