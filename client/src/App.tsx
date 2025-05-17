import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Course from "@/pages/Course";
import LessonPage from "@/pages/LessonPage";
import AllCourses from "@/pages/AllCourses";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";

// Auth route guard component
import { useRequireAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={AllCourses} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/course/:courseId" component={Course} />
      <Route path="/course/:courseId/resume" component={Course} />
      <Route path="/lesson/:lessonId" component={LessonPage} />
      <Route path="/courses/my-courses">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/certificates">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/category/:categoryName" component={AllCourses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
