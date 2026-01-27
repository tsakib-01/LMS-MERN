import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import { getDashboard } from '../services/userService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Mock dashboard data for now
        const mockData = {
          enrolledCourses: [
            {
              _id: "1",
              title: "Introduction to React",
              progress: 65,
              completed: false
            },
            {
              _id: "2",
              title: "Advanced JavaScript",
              progress: 100,
              completed: true
            }
          ],
          createdCourses: [
            {
              _id: "3",
              title: "Web Development Bootcamp",
              enrolledStudents: ["user1", "user2", "user3"]
            }
          ]
        };
        
        setDashboardData(mockData);
        // const response = await getDashboard();
        // setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center py-8">No dashboard data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
          <div className="space-y-4">
            {dashboardData.enrolledCourses.length > 0 ? (
              dashboardData.enrolledCourses.map(course => (
                <div key={course._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">Progress: {course.progress}%</p>
                      {course.completed && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No enrolled courses yet</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Created Courses</h2>
          <div className="space-y-4">
            {dashboardData.createdCourses.length > 0 ? (
              dashboardData.createdCourses.map(course => (
                <div key={course._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.enrolledStudents.length} students</p>
                    </div>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No created courses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;