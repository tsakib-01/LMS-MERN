import api from './api';

// ===== DASHBOARD FUNCTIONS =====

// Get student dashboard data
export const getStudentDashboard = async () => {
  try {
    const response = await api.get('/dashboard/student');
    return response;
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    throw error;
  }
};

// Get instructor dashboard data
export const getInstructorDashboard = async () => {
  try {
    const response = await api.get('/dashboard/instructor');
    return response;
  } catch (error) {
    console.error('Error fetching instructor dashboard:', error);
    throw error;
  }
};

// ===== USER PROFILE FUNCTIONS =====

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ===== COURSE FUNCTIONS =====

// Get user's enrolled courses
export const getEnrolledCourses = async () => {
  try {
    const response = await api.get('/users/enrolled-courses');
    return response;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

// Get user's created courses (for instructors)
export const getCreatedCourses = async () => {
  try {
    const response = await api.get('/users/created-courses');
    return response;
  } catch (error) {
    console.error('Error fetching created courses:', error);
    throw error;
  }
};

// ===== ASSIGNMENT FUNCTIONS =====

// Get assignments
export const getAssignments = async () => {
  try {
    const response = await api.get('/assignments');
    return response;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// ===== QUIZ FUNCTIONS =====

// Get quizzes
export const getQuizzes = async () => {
  try {
    const response = await api.get('/quizzes');
    return response;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};