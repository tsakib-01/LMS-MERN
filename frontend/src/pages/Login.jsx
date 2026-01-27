import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For demo purposes, keep admin hardcoded if needed
      if (role === "admin" && email === "admin@email.com" && password === "777") {
        const userData = {
          name: "Admin",
          email,
          token: "admin-token-123",
          role: "admin"
        };
        login(userData);
       navigate("/admin/dashboard");
        return;
      }

      // REAL API CALL for Teacher/Student
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Store user data
   const userData = {
  ...data.user,
  token: data.token,
  isActive: data.user.isActive ?? true
};


      // Call login from auth context
      login(userData);
// In Login.jsx - find the redirect section and update:

// Redirect based on role
if (data.user.role === "admin") {
  navigate("/admin/dashboard");
} else if (data.user.role === "teacher") {
  navigate("/teacher/dashboard");  // Changed from "/teacher/TeacherDashboard"
} else {
  navigate("/dashboard");
}

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-3 px-3 rounded-lg border-2 transition-all ${
                  role === "student"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  {/* <div className="text-2xl mb-1">🎓</div> */}
                  <div className="font-medium text-sm">Student</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-3 px-3 rounded-lg border-2 transition-all ${
                  role === "teacher"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  {/* <div className="text-2xl mb-1">👨‍🏫</div> */}
                  <div className="font-medium text-sm">Teacher</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-3 px-3 rounded-lg border-2 transition-all ${
                  role === "admin"
                    ? "border-purple-600 bg-purple-50 text-purple-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  {/* <div className="text-2xl mb-1">👑</div> */}
                  <div className="font-medium text-sm">Admin</div>
                </div>
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register here
          </Link>
        </div>

        {/* Demo Info - Optional */}
        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@email.com / 777</p>
              <p><strong>Teacher:</strong> Use your registered teacher email</p>
              <p><strong>Student:</strong> Use your registered student email</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;