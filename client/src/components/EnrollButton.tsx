import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface EnrollButtonProps {
  courseId: number;
  isEnrolled?: boolean;
}

export function EnrollButton({ courseId, isEnrolled = false }: EnrollButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enrollments", { courseId });
    },
    onSuccess: () => {
      toast({
        title: "Successfully enrolled!",
        description: "You have been enrolled in this course.",
      });
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      
      // Redirect to the course page
      navigate(`/course/${courseId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "Failed to enroll. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate(`/login?redirect=/course/${courseId}`);
      return;
    }
    
    if (!isEnrolled) {
      enrollMutation.mutate();
    } else {
      // Already enrolled, navigate to course page
      navigate(`/course/${courseId}`);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={enrollMutation.isPending}
      className="w-full"
    >
      {enrollMutation.isPending 
        ? "Enrolling..." 
        : isEnrolled 
          ? "Continue Learning" 
          : "Enroll Now"}
    </Button>
  );
}