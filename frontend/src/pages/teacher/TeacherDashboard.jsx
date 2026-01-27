// pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    activeCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentCourses(data.recentCourses || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
              </div>
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                📚
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Submissions</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingSubmissions}</p>
              </div>
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Courses</p>
                <p className="text-3xl font-bold mt-2">{stats.activeCourses}</p>
              </div>
              <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/teacher/courses/create"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span className="text-3xl mr-4">➕</span>
              <div>
                <h3 className="font-semibold">Create New Course</h3>
                <p className="text-sm text-gray-600">Start building a new course</p>
              </div>
            </Link>

            <Link
              to="/teacher/assignments"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <span className="text-3xl mr-4">📝</span>
              <div>
                <h3 className="font-semibold">View Assignments</h3>
                <p className="text-sm text-gray-600">Check student submissions</p>
              </div>
            </Link>

            <Link
              to="/teacher/quizzes"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <span className="text-3xl mr-4">❓</span>
              <div>
                <h3 className="font-semibold">Create Quiz</h3>
                <p className="text-sm text-gray-600">Add new quiz to courses</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Courses</h2>
            <Link to="/teacher/courses" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {recentCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No courses yet. Create your first course!</p>
              <Link
                to="/teacher/courses/create"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCourses.map((course) => (
                <Link
                  key={course._id}
                  to={`/teacher/courses/${course._id}`}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-gray-200 rounded mb-3 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>👥 {course.enrolledStudents?.length || 0} students</span>
                    <span className={`px-2 py-1 rounded ${course.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;