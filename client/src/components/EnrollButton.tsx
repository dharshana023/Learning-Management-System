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
}

export function EnrollButton({ courseId, isEnrolled = false }: EnrollButtonProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      return await apiRequest("POST", `/api/enrollments`, { courseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      
      toast({
        title: "Successfully enrolled",
        description: "You have been enrolled in this course",
      });
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    await mutation.mutateAsync();
    setLoading(false);
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