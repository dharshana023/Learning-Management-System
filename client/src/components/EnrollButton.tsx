import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface EnrollButtonProps {
  courseId: number;
  isEnrolled?: boolean;
  onEnrollmentSuccess?: () => void;
}

export function EnrollButton({ courseId, isEnrolled = false, onEnrollmentSuccess }: EnrollButtonProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        // Store the intended course to enroll in for after login
        sessionStorage.setItem('pendingEnrollment', String(courseId));
        navigate('/login');
        return null;
      }
      
      return await apiRequest("POST", `/api/enrollments`, { 
        courseId: Number(courseId),
        userId: user.id
      });
    },
    onSuccess: (data) => {
      if (data) {
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
        queryClient.invalidateQueries({ queryKey: ['/api/progress/recent'] });
        
        toast({
          title: "Successfully enrolled",
          description: "You have been enrolled in this course",
        });
        
        // Call the callback if provided
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enroll",
        description: error.message || "An error occurred while enrolling in this course",
        variant: "destructive",
      });
    },
  });
  
  const handleEnroll = async () => {
    if (!isAuthenticated || !user) {
      // Store the intended course to enroll in for after login
      sessionStorage.setItem('pendingEnrollment', String(courseId));
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await mutation.mutateAsync();
      // If successful, reset enrollment state
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment failed",
        description: "There was an error enrolling in this course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isEnrolled) {
    return (
      <Button 
        onClick={() => navigate(`/course/${courseId}/resume`)}
        className="w-full"
      >
        Continue Learning
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={handleEnroll}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Enrolling..." : "Enroll Now"}
    </Button>
  );
}