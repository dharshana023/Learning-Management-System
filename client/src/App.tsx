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
import { HelmetProvider } from "react-helmet-async";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={AllCourses} />
      <Route path="/course/:courseId" component={Course} />
      <Route path="/course/:courseId/resume" component={Course} />
      <Route path="/lesson/:lessonId" component={LessonPage} />
      <Route path="/courses/my-courses" component={Home} />
      <Route path="/certificates" component={Home} />
      <Route path="/category/:categoryName" component={AllCourses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
