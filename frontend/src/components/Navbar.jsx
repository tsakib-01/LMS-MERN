import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sample course categories - you can fetch these from your API
  const courseCategories = [
    { name: "Web Development", icon: "💻", path: "/courses?category=web" },
    { name: "Mobile Development", icon: "📱", path: "/courses?category=mobile" },
    { name: "Data Science", icon: "📊", path: "/courses?category=data" },
    { name: "Design", icon: "🎨", path: "/courses?category=design" },
    { name: "Business", icon: "💼", path: "/courses?category=business" },
    { name: "Marketing", icon: "📢", path: "/courses?category=marketing" },
  ];

  return (
    <>
      {/* Main Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 md:hidden mr-2"
              >
                ☰
              </button>
     <Link to="/" className="flex items-center">
  <img
    src="/logo.png"
    alt="Learning Logo"
    className="w-28 h-28 object-contain"
  />
</Link>


            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-gray-900 transition font-medium ${
                  location.pathname === "/" ? "text-gray-900" : ""
                }`}
              >
                Home
              </Link>

              <Link 
                to="/about" 
                className={`text-gray-700 hover:text-gray-900 transition font-medium ${
                  location.pathname === "/about" ? "text-gray-900" : ""
                }`}
              >
                About
              </Link>
              
              {user?.role === "admin" ? (
                // Admin Navigation
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/admin/dashboard" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                  {/* <Link 
                    to="/admin/messages" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/admin/messages" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Messages
                  </Link>
                  <Link 
                    to="/admin/content-editor" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/admin/content-editor" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Content Editor
                  </Link> */}
                </>
              ) : user?.role === "teacher" ? (
                // Teacher Navigation
                <>
                  <Link 
                    to="/teacher/dashboard" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/teacher/dashboard" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/teacher/courses" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/teacher/courses" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    My Courses
                  </Link>
                  <Link 
                    to="/teacher/assignments" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/teacher/assignments" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Assignments
                  </Link>
                  <Link 
                    to="/teacher/quizzes" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/teacher/quizzes" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Quizzes
                  </Link>
                </>
              ) : user?.role === "student" ? (
                // Student Navigation
                <>
                  {/* Courses Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setCoursesDropdownOpen(true)}
                    onMouseLeave={() => setCoursesDropdownOpen(false)}
                  >
                    <button 
                      className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition ${
                        location.pathname === "/courses" ? "text-gray-900 font-semibold" : ""
                      }`}
                    >
                      <span>Courses</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {coursesDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50">
                        <div className="px-4 pb-3 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Browse by Category</h3>
                        </div>
                        <div className="py-2">
                          {courseCategories.map((category, idx) => (
                            <Link
                              key={idx}
                              to={category.path}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition"
                              onClick={() => setCoursesDropdownOpen(false)}
                            >
                              <span className="text-2xl">{category.icon}</span>
                              <span className="text-gray-700 hover:text-gray-900 font-medium">{category.name}</span>
                            </Link>
                          ))}
                        </div>
                        <div className="px-4 pt-3 border-t border-gray-100">
                          <Link
                            to="/courses"
                            className="block text-center text-orange-600 hover:text-orange-700 font-semibold text-sm"
                            onClick={() => setCoursesDropdownOpen(false)}
                          >
                            View All Courses →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link 
                    to="/dashboard" 
                    className={`text-gray-700 hover:text-gray-900 transition ${
                      location.pathname === "/dashboard" ? "text-gray-900 font-semibold" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                // Not logged in - Show courses dropdown for everyone
                <div 
                  className="relative"
                  onMouseEnter={() => setCoursesDropdownOpen(true)}
                  onMouseLeave={() => setCoursesDropdownOpen(false)}
                >
                  <button 
                    className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition"
                  >
                    <span>Courses</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {coursesDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50">
                      <div className="px-4 pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Browse by Category</h3>
                      </div>
                      <div className="py-2">
                        {courseCategories.map((category, idx) => (
                          <Link
                            key={idx}
                            to={category.path}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition"
                            onClick={() => setCoursesDropdownOpen(false)}
                          >
                            <span className="text-2xl">{category.icon}</span>
                            <span className="text-gray-700 hover:text-gray-900 font-medium">{category.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="px-4 pt-3 border-t border-gray-100">
                        <Link
                          to="/courses"
                          className="block text-center text-orange-600 hover:text-orange-700 font-semibold text-sm"
                          onClick={() => setCoursesDropdownOpen(false)}
                        >
                          View All Courses →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link 
                to="/contact" 
                className={`text-gray-700 hover:text-gray-900 transition font-medium ${
                  location.pathname === "/contact" ? "text-gray-900" : ""
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                     {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <nav className="px-4 py-4 space-y-2">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-gray-900 py-2.5 font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              Home
            </Link>

            <Link 
              to="/about" 
              className="block text-gray-700 hover:text-gray-900 py-2.5 font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              About
            </Link>
            
            {user?.role === "admin" ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/messages" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  to="/admin/content-editor" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Content Editor
                </Link>
              </>
            ) : user?.role === "teacher" ? (
              <>
                <Link 
                  to="/teacher/dashboard" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/teacher/courses" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  My Courses
                </Link>
                <Link 
                  to="/teacher/assignments" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Assignments
                </Link>
                <Link 
                  to="/teacher/quizzes" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Quizzes
                </Link>
              </>
            ) : user?.role === "student" ? (
              <>
                <div>
                  <button
                    onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                    className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900 py-2.5 font-medium"
                  >
                    <span>Courses</span>
                    <svg className={`w-4 h-4 transition-transform ${coursesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {coursesDropdownOpen && (
                    <div className="pl-4 space-y-2 mt-2">
                      {courseCategories.map((category, idx) => (
                        <Link
                          key={idx}
                          to={category.path}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 py-2"
                          onClick={() => {
                            setSidebarOpen(false);
                            setCoursesDropdownOpen(false);
                          }}
                        >
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.name}</span>
                        </Link>
                      ))}
                      <Link
                        to="/courses"
                        className="block text-orange-600 hover:text-orange-700 py-2 text-sm font-semibold"
                        onClick={() => {
                          setSidebarOpen(false);
                          setCoursesDropdownOpen(false);
                        }}
                      >
                        View All Courses →
                      </Link>
                    </div>
                  )}
                </div>
                <Link 
                  to="/dashboard" 
                  className="block text-gray-700 hover:text-gray-900 py-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <div>
                <button
                  onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900 py-2.5 font-medium"
                >
                  <span>Courses</span>
                  <svg className={`w-4 h-4 transition-transform ${coursesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {coursesDropdownOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    {courseCategories.map((category, idx) => (
                      <Link
                        key={idx}
                        to={category.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 py-2"
                        onClick={() => {
                          setSidebarOpen(false);
                          setCoursesDropdownOpen(false);
                        }}
                      >
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    ))}
                    <Link
                      to="/courses"
                      className="block text-orange-600 hover:text-orange-700 py-2 text-sm font-semibold"
                      onClick={() => {
                        setSidebarOpen(false);
                        setCoursesDropdownOpen(false);
                      }}
                    >
                      View All Courses →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link 
              to="/contact" 
              className="block text-gray-700 hover:text-gray-900 py-2.5 font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              Contact
            </Link>

            {user && (
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center space-x-3 pb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                   {user?.name?.charAt(0)?.toUpperCase() || "U"}

                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;