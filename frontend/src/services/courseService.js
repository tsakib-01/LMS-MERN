import api from './api';

export const getAllCourses = () => api.get('/courses');
export const searchCourses = (params) => api.get('/courses/search', { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (courseData) => api.post('/courses', courseData);
export const updateCourse = (id, courseData) => api.put(`/courses/${id}`, courseData);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll`);
export const addReview = (id, reviewData) => api.post(`/courses/${id}/review`, reviewData);
export const completeLesson = (id, lessonData) => api.post(`/courses/${id}/complete-lesson`, lessonData);