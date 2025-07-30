import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BrowseCourses from "@/pages/browse-courses";
import CourseDetail from "@/pages/course-detail";
import CreateCourse from "@/pages/create-course";
import Checkout from "@/pages/checkout";
import LandingPage from "@/pages/landing";
import Login from "@/components/Auth/Login";
import Signup from "@/components/Auth/Signup";
import { AuthProvider } from "@/context/authContext";

import { useAuth } from "@/context/authContext";
import { Redirect } from "wouter";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : LandingPage} />
      <Route path="/dashboard">
        {user ? <Dashboard /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {!user ? <Login /> : <Redirect to="/dashboard" />}
      </Route>
      <Route path="/signup">
        {!user ? <Signup /> : <Redirect to="/dashboard" />}
      </Route>
      <Route path="/browse">
        {user ? <BrowseCourses /> : <Redirect to="/login" />}
      </Route>
      <Route path="/my-courses">
        {user ? <Dashboard /> : <Redirect to="/login" />}
      </Route>
      <Route path="/courses/:id">
        {user ? <CourseDetail /> : <Redirect to="/login" />}
      </Route>
      <Route path="/create-course">
        {user ? <CreateCourse /> : <Redirect to="/login" />}
      </Route>
      <Route path="/checkout">
        {user ? <Checkout /> : <Redirect to="/login" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
              <Router />
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
