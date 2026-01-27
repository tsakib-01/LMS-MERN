import { Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// Admin Page
import AdminDashboard from "../pages/admin/dashboard";

// General Pages
import About from "../pages/About";
import Contact from "../pages/Contact";

// Student pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CourseDetail from "../pages/CourseDetail";
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/Courses";

// Teacher pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherCourses from "../pages/teacher/TeacherCourses";
import TeacherAssignments from "../pages/teacher/TeacherAssignments";
import TeacherQuizzes from "../pages/teacher/TeacherQuizzes";
import CreateCourse from "../pages/teacher/CreateCourse";
import EditCourse from "../pages/teacher/EditCourse";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Routes>
      {/* Admin route - Single dashboard */}
      <Route 
        path="admin/dashboard" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Public routes */}
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="courses" element={<Courses />} /> 
      <Route path="courses/:id" element={<CourseDetail />} />
      
      {/* Student routes */}
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute requiredRole="student">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Teacher routes */}
      <Route 
        path="teacher/dashboard" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="teacher/courses" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherCourses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="teacher/courses/create" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <CreateCourse />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="teacher/courses/:id/edit" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <EditCourse />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="teacher/assignments" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherAssignments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="teacher/quizzes" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherQuizzes />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;