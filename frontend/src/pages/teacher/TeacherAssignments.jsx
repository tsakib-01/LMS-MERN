// pages/teacher/TeacherAssignments.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getFileSrc = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${path}`;
};

const PdfInlineViewer = ({ url, title }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load PDF');
        return res.blob();
      })
      .then(blob => {
        if (active) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const localUrl = URL.createObjectURL(pdfBlob);
          setBlobUrl(localUrl);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error loading PDF blob:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        <span className="text-gray-500 font-medium mt-2">Loading PDF inline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-red-50 rounded-xl border border-red-200 p-6 text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="text-gray-700 font-semibold mb-2">Could not display PDF inline</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold transition"
        >
          Open PDF in New Tab ↗
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      className="w-full"
      style={{ height: '500px' }}
      title={title}
    />
  );
};

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grade, feedback })
      });

      if (response.ok) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const pendingSubmissions = submissions.filter(s => !s.graded);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-2">Manage assignments and grade submissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <span className="mr-2">➕</span>
            Create Assignment
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 font-medium ${activeTab === 'assignments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              All Assignments ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 font-medium ${activeTab === 'submissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Pending Submissions ({pendingSubmissions.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'assignments' ? (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
                <p className="text-gray-600 mb-6">Create your first assignment</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                      <p className="text-gray-600 mb-4">{assignment.description}</p>
                      
                      <div className="flex gap-4 text-sm text-gray-600 mb-3">
                        <span>📚 {assignment.course?.title || 'N/A'}</span>
                        <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                        <span>📊 {assignment.submissions?.length || 0} submissions</span>
                      </div>

                      {/* Show attachments if any */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={getFileSrc(attachment)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                              >
                                📎 File {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAssignment(assignment)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAssignment(assignment._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending submissions to grade</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  onGrade={gradeSubmission}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateEditAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAssignments();
          }}
        />
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <CreateEditAssignmentModal
          assignment={editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSuccess={() => {
            setEditingAssignment(null);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};
const SubmissionCard = ({ submission, onGrade }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showGradeForm, setShowGradeForm] = useState(false);

  const handleGrade = () => {
    if (!grade) {
      alert('Please enter a grade');
      return;
    }
    onGrade(submission._id, grade, feedback);
    setShowGradeForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{submission.assignment?.title}</h3>
          <p className="text-gray-600">Student: {submission.student?.name}</p>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowGradeForm(!showGradeForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Grade
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-3">{submission.content}</p>

        {submission.files && submission.files.length > 0 && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">📎 Submitted Files:</p>
            {submission.files.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12V6h-4V2H4v16zm8-17.4L15.4 4H12V.6zM2 0v20h16V5l-5-5H2z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.originalName || file.filename}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <a 
                    href={getFileSrc(file.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Open
                  </a>
                </div>

                {file.mimetype === 'application/pdf' && (
                  <PdfInlineViewer url={getFileSrc(file.path)} title={file.originalName || file.filename} />
                )}

                {file.mimetype?.startsWith('image/') && (
                  <img
                    src={getFileSrc(file.path)}
                    alt={file.originalName}
                    className="w-full max-h-64 object-contain p-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showGradeForm && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0-100"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Provide feedback to the student..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGrade}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit Grade
            </button>
            <button
              onClick={() => setShowGradeForm(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const CreateEditAssignmentModal = ({ assignment, onClose, onSuccess }) => {
  const isEditing = !!assignment;
  
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    course: assignment?.course?._id || assignment?.course || '',
    deadline: assignment?.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
    maxGrade: assignment?.maxGrade || 100
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState(assignment?.attachments || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course) {
      alert('Please select a course');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('course', formData.course);
      submitData.append('deadline', formData.deadline);
      submitData.append('maxGrade', formData.maxGrade);
      
      // Add existing attachments (for edit mode)
      if (isEditing) {
        submitData.append('existingAttachments', JSON.stringify(existingAttachments));
      }
      
      // Add new files
      attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/assignments/${assignment._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/assignments`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser sets it automatically with boundary
        },
        body: submitData
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${isEditing ? 'update' : 'create'} assignment`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} assignment:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} assignment`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Assignment title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Assignment instructions and details"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a course</option>
              {loading ? (
                <option disabled>Loading your courses...</option>
              ) : courses.length === 0 ? (
                <option disabled>No courses available - Create a course first</option>
              ) : (
                courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))
              )}
            </select>
            {!loading && courses.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                You need to create a course before creating assignments
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Grade
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxGrade}
                onChange={(e) => setFormData({ ...formData, maxGrade: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (PDF, Images, Documents)
            </label>
            
            {/* Existing attachments (for edit mode) */}
            {isEditing && existingAttachments.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Current attachments:</p>
                <div className="space-y-2">
                  {existingAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <a
                        href={getFileSrc(attachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        📎 {attachment.split('/').pop()}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can upload multiple files (PDF, Word, Images, etc.)
            </p>
            
            {attachments.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {attachments.length} new file(s) selected
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || courses.length === 0 || uploading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : (isEditing ? 'Update Assignment' : 'Create Assignment')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAssignments;