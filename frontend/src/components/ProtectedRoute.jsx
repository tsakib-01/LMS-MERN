import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Debug logs - REMOVE in production
  console.log("🛡️ ProtectedRoute Debug:");
  console.log("User object:", user);
  console.log("User role:", user?.role);
  console.log("Required role:", requiredRole);
  console.log("User isActive:", user?.isActive);

  // Show loading while checking auth
  if (loading) {
    console.log("🛡️ Loading auth state...");
    return <div className="text-center py-8">Loading...</div>;
  }

  // Not logged in - redirect to login
  if (!user) {
    console.log("🛡️ No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user role matches required role
  if (requiredRole) {
    console.log(`🛡️ Checking roles: User is "${user.role}", required "${requiredRole}"`);
    
    if (user.role !== requiredRole) {
      console.log(`🛡️ Role mismatch! Redirecting...`);
      
      // Determine correct dashboard based on user's actual role
      let redirectTo;
      switch(user.role) {
        case "admin":
          redirectTo = "/admin/dashboard";
          break;
        case "teacher":
          redirectTo = "/teacher/dashboard";
          break;
        case "student":
        default:
          redirectTo = "/dashboard";
      }
      
      console.log(`🛡️ Redirecting ${user.role} to ${redirectTo}`);
      return <Navigate to={redirectTo} replace />;
    }
    
    console.log(`🛡️ Role check passed! User "${user.role}" can access "${requiredRole}" route`);
  } else {
    console.log(`🛡️ No role required, access granted`);
  }

  // Special check for teacher approval
  if (user.role === "teacher" && !user.isActive) {
    console.log(`🛡️ Teacher ${user.email} is not approved yet`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Pending Approval</h2>
          <p className="text-yellow-700 mb-4">
            Your teacher account is pending admin approval. 
            You'll receive an email once approved.
          </p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  console.log(`🛡️ Access granted to ${user.name} (${user.role})`);
  return children;
}