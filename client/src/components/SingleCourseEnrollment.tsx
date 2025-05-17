import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { EnrollButton } from "@/components/EnrollButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SingleCourseEnrollmentProps {
  courseId: string | number;
  onSuccess?: () => void;
}

export default function SingleCourseEnrollment({ courseId, onSuccess }: SingleCourseEnrollmentProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [enrolling, setEnrolling] = useState(false);
  
  // Fetch enrollment status if user is logged in
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: [`/api/enrollments/${courseId}`],
    enabled: !!user,
  });

  const handleEnrollmentSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
    
    toast({
      title: "Successfully enrolled",
      description: "You have been enrolled in this course",
    });
  };
  
  const handleEnroll = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    setEnrolling(true);
    try {
      await apiRequest("POST", "/api/enrollments", { 
        courseId: Number(courseId)
      });
      handleEnrollmentSuccess();
    } catch (error) {
      toast({
        title: "Failed to enroll",
        description: "An error occurred while enrolling in this course",
        variant: "destructive",
      });
      console.error("Enrollment error:", error);
    } finally {
      setEnrolling(false);
    }
  };
  
  if (enrollmentLoading) {
    return (
      <Button disabled className="w-full opacity-70">
        Loading...
      </Button>
    );
  }
  
  if (enrollment) {
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
      disabled={enrolling}
      className="w-full"
    >
      {enrolling ? "Enrolling..." : "Enroll Now"}
    </Button>
  );
}