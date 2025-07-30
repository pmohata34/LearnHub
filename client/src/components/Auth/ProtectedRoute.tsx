import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
