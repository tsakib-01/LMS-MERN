// pages/teacher/EditCourse.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, lessons
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    content: '',
    duration: '',
    isPreview: false
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      type: 'video',
      videoUrl: '',
      content: '',
      duration: '',
      isPreview: false
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      videoUrl: lesson.videoUrl || '',
      content: lesson.content || '',
      duration: lesson.duration || '',
      isPreview: lesson.isPreview || false
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingLesson
        ? `http://localhost:5000/api/teacher/courses/${id}/lessons/${editingLesson._id}`
        : `http://localhost:5000/api/teacher/courses/${id}/lessons`;
      
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonForm)
      });

      if (response.ok) {
        alert(editingLesson ? 'Lesson updated!' : 'Lesson added!');
        setShowLessonModal(false);
        fetchCourse();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save lesson');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/courses/${id}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Lesson deleted!');
        fetchCourse();
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/courses')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">{course.title}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Course Details
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-6 py-3 font-medium ${activeTab === 'lessons' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Lessons ({course.lessons?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'details' ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600">Course details editing coming soon...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Add Lesson Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
              <button
                onClick={handleAddLesson}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <span className="mr-2">➕</span>
                Add Lesson
              </button>
            </div>

            {/* Lessons List */}
            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-4">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <div key={lesson._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-lg text-gray-900">{lesson.title}</h3>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                {lesson.type}
                              </span>
                              {lesson.isPreview && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {lesson.duration && <span>⏱️ {lesson.duration}</span>}
                              {lesson.videoUrl && <span>🎥 Video</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
                <p className="text-gray-600 mb-6">Start adding lessons to your course</p>
                <button
                  onClick={handleAddLesson}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Add First Lesson
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lesson Modal */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Introduction to React Hooks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of what students will learn"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Type *
                      </label>
                      <select
                        value={lessonForm.type}
                        onChange={(e) => setLessonForm({...lessonForm, type: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text/Article</option>
                        <option value="pdf">PDF Document</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 15 min"
                      />
                    </div>
                  </div>

                  {lessonForm.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL (YouTube, Vimeo, etc.)
                      </label>
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  {lessonForm.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Content
                      </label>
                      <textarea
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                        rows="8"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your lesson content here..."
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={lessonForm.isPreview}
                      onChange={(e) => setLessonForm({...lessonForm, isPreview: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Allow free preview (students can watch without enrolling)
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSaveLesson}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                  </button>
                  <button
                    onClick={() => setShowLessonModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCourse;