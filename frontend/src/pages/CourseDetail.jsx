import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [progress, setProgress] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentSubmission, setAssignmentSubmission] = useState({ text: '', file: null });
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEnrolled = user && course?.enrolledStudents?.some(
    student => student._id === user.id || student === user.id
  );

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/courses/${id}`);
      
      if (!response.ok) {
        throw new Error('Course not found');
      }

      const data = await response.json();
      console.log('✅ Course fetched:', data);
      setCourse(data.course);
      
      if (data.course.lessons && data.course.lessons.length > 0) {
        setSelectedLesson(data.course.lessons[0]);
      }
      
      if (user && data.course.enrolledStudents?.includes(user.id)) {
        const completed = 0;
        const total = data.course.lessons?.length || 0;
        setProgress(total > 0 ? (completed / total) * 100 : 0);
      }
    } catch (error) {
      console.error('💥 Error fetching course:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Successfully enrolled in course!');
        fetchCourse();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('💥 Enrollment failed:', error);
      alert('Failed to enroll in course');
    }
  };

  const handleReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!review.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(review)
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setReview({ rating: 5, comment: '' });
        fetchCourse();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('💥 Review failed:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons([...completedLessons, lessonId]);
        const newProgress = ((completedLessons.length + 1) / (course.lessons?.length || 1)) * 100;
        setProgress(newProgress);
        alert('Lesson completed! 🎉');
      }
    } catch (error) {
      console.error('💥 Failed to complete lesson:', error);
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentSubmission({ text: '', file: null });
  };

  const handleSubmitAssignment = async () => {
    if (!assignmentSubmission.text.trim() && !assignmentSubmission.file) {
      alert('Please provide your answer or attach a file');
      return;
    }

    try {
      setSubmittingAssignment(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('text', assignmentSubmission.text);
      if (assignmentSubmission.file) {
        formData.append('file', assignmentSubmission.file);
      }

      const response = await fetch(
        `http://localhost:5000/api/courses/${id}/assignments/${selectedAssignment._id}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (response.ok) {
        alert('Assignment submitted successfully! 🎉');
        setAssignmentSubmission({ text: '', file: null });
        setSelectedAssignment(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Assignment submission error:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(null));
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    
    const unanswered = quizAnswers.some(answer => answer === null);
    if (unanswered) {
      alert('Please answer all questions before submitting');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}/quizzes/${selectedQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: quizAnswers })
      });
      
      if (response.ok) {
        const result = await response.json();
        setQuizResult(result);
        setQuizSubmitted(true);
      } else {
        const error = await response.json();
        console.error('Quiz submission error:', error);
        alert(error.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    if (url.includes('embed')) {
      return url;
    }
    
    return url;
  };

  const renderLessonContent = () => {
    if (!selectedLesson) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">Select a lesson to start learning</p>
          </div>
        </div>
      );
    }

    const canAccess = isEnrolled || selectedLesson.isPreview;

    if (!canAccess) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-600 mb-4">This lesson is locked</p>
            <button
              onClick={handleEnroll}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Enroll to Access
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {selectedLesson.type === 'video' && selectedLesson.videoUrl && (
          <div className="aspect-video bg-black">
            <iframe
              src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
              className="w-full h-full"
              allowFullScreen
              title={selectedLesson.title}
            />
          </div>
        )}

        {selectedLesson.type === 'text' && (
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-700 text-lg">Text lesson content below</p>
            </div>
          </div>
        )}

        {selectedLesson.type === 'quiz' && (
          <div className="aspect-video bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <p className="text-gray-700 text-lg">Quiz coming soon</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
              <p className="text-gray-600">{selectedLesson.description}</p>
            </div>
            {isEnrolled && (
              <button
                onClick={() => handleCompleteLesson(selectedLesson._id)}
                disabled={completedLessons.includes(selectedLesson._id)}
                className={`ml-4 px-6 py-2 rounded-lg font-semibold transition ${
                  completedLessons.includes(selectedLesson._id)
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {completedLessons.includes(selectedLesson._id) ? '✓ Completed' : 'Mark Complete'}
              </button>
            )}
          </div>

          {selectedLesson.type === 'text' && selectedLesson.content && (
            <div className="mt-6 prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedLesson.content}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-6 pt-6 border-t">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {selectedLesson.type.toUpperCase()}
            </span>
            {selectedLesson.duration && (
              <span className="text-gray-600">⏱️ {selectedLesson.duration}</span>
            )}
            {selectedLesson.isPreview && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Free Preview
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentsTab = () => {
    const assignments = course.assignments || [];
    
    if (selectedAssignment) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
          >
            ← Back to Assignments
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedAssignment.title}</h2>
          <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(selectedAssignment.deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maximum Grade</p>
              <p className="font-semibold text-gray-900">{selectedAssignment.maxGrade} points</p>
            </div>
          </div>
          
          {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {selectedAssignment.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>📎</span>
                    <span>Attachment {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Work</h3>
            <textarea
              value={assignmentSubmission.text}
              onChange={(e) => setAssignmentSubmission({...assignmentSubmission, text: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows="6"
              placeholder="Type your answer here or paste a link to your work..."
            ></textarea>
            {assignmentSubmission.file && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-700">📎 {assignmentSubmission.file.name}</span>
                <button
                  onClick={() => setAssignmentSubmission({...assignmentSubmission, file: null})}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSubmitAssignment}
                disabled={submittingAssignment}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submittingAssignment ? 'Submitting...' : 'Submit Assignment'}
              </button>
              <label className="cursor-pointer bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
                📎 Attach File
                <input 
                  type="file" 
                  className="hidden"
                  onChange={(e) => setAssignmentSubmission({...assignmentSubmission, file: e.target.files[0]})}
                />
              </label>
            </div>
          </div>
        </div>
      );
    }
    
    if (!isEnrolled) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Enroll to view assignments</p>
          <button
            onClick={handleEnroll}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Enroll Now
          </button>
        </div>
      );
    }
    
    if (assignments.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600">No assignments available yet</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <div key={assignment._id || index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-gray-600">{assignment.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
              {assignment.deadline && (
                <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
              )}
              {assignment.maxGrade && (
                <span>🎯 {assignment.maxGrade} points</span>
              )}
            </div>

            <button
              onClick={() => handleViewAssignment(assignment)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Assignment
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderQuizzesTab = () => {
    const quizzes = course.quizzes || [];
    
    if (selectedQuiz) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          {!quizSubmitted ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  ← Back to Quizzes
                </button>
                <div className="text-sm text-gray-500">
                  ⏱️ Time Limit: {selectedQuiz.duration} minutes
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedQuiz.title}</h2>
              <p className="text-gray-600 mb-8">{selectedQuiz.description}</p>
              
              <div className="space-y-8">
                {selectedQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border-b pb-6 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => {
                              const newAnswers = [...quizAnswers];
                              newAnswers[qIndex] = oIndex;
                              setQuizAnswers(newAnswers);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleSubmitQuiz}
                className="mt-8 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Submit Quiz
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-6">
                {quizResult?.passed ? '🎉' : '📚'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {quizResult?.passed ? 'Congratulations!' : 'Keep Learning!'}
              </h2>
              <div className="text-6xl font-bold mb-6" style={{color: quizResult?.passed ? '#10b981' : '#ef4444'}}>
                {quizResult?.score.toFixed(1)}%
              </div>
              <p className="text-gray-600 mb-2">
                You got {quizResult?.correct} out of {quizResult?.total} questions correct
              </p>
              <p className="text-gray-600 mb-8">
                Passing score: {selectedQuiz.passingScore}%
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Back to Quizzes
                </button>
                {!quizResult?.passed && (
                  <button
                    onClick={() => handleStartQuiz(selectedQuiz)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (!isEnrolled) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Enroll to view quizzes</p>
          <button
            onClick={handleEnroll}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Enroll Now
          </button>
        </div>
      );
    }
    
    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">❓</div>
          <p className="text-gray-600">No quizzes available yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {quizzes.map((quiz, index) => (
          <div key={quiz._id || index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
              {quiz.questions && (
                <span>📋 {quiz.questions.length} Questions</span>
              )}
              {quiz.duration && (
                <span>⏱️ {quiz.duration} minutes</span>
              )}
              {quiz.passingScore && (
                <span>✅ Passing: {quiz.passingScore}%</span>
              )}
            </div>

            <button
              onClick={() => handleStartQuiz(quiz)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={() => navigate('/courses')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-600 text-xl mb-4">Course not found</div>
        <button
          onClick={() => navigate('/courses')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Courses
        </button>
      </div>
    );
  }

  const averageRating = course?.averageRating || 0;
  const totalRatings = course?.totalRatings || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/courses')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Courses
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
                    {course.instructor?.name?.charAt(0) || 'T'}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {course.instructor?.name || 'Instructor'}
                  </span>
                </div>
                
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {course.level || 'All Levels'}
                </span>
                
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {course.category}
                </span>

                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({totalRatings})</span>
                </div>

                <span className="text-gray-500">
                  👥 {course.enrolledStudents?.length || 0} students
                </span>
              </div>
            </div>

            <div className="ml-6 text-right">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              {isEnrolled ? (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Enrolled
                </span>
              ) : course.isPublished ? (
                <button
                  onClick={handleEnroll}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                </button>
              ) : (
                <span className="text-gray-500 italic">Not Published</span>
              )}
            </div>
          </div>

          {isEnrolled && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'lessons'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Lessons ({course.lessons?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'assignments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Assignments ({course.assignments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'quizzes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ❓ Quizzes ({course.quizzes?.length || 0})
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        {activeTab === 'lessons' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player / Content Area */}
            <div className="lg:col-span-2">
              {renderLessonContent()}
            </div>

            {/* Lesson Playlist Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <h3 className="text-lg font-bold">Course Content</h3>
                  <p className="text-sm opacity-90">
                    {course.lessons?.length || 0} lessons
                  </p>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto">
                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="divide-y">
                      {course.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson, index) => {
                          const isSelected = selectedLesson?._id === lesson._id;
                          const isCompleted = completedLessons.includes(lesson._id);
                          const canAccess = isEnrolled || lesson.isPreview;

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => setSelectedLesson(lesson)}
                              disabled={!canAccess}
                              className={`w-full text-left p-4 transition ${
                                isSelected 
                                  ? 'bg-blue-50 border-l-4 border-blue-600' 
                                  : 'hover:bg-gray-50'
                              } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 ${
                                  isCompleted 
                                    ? 'bg-green-500 text-white' 
                                    : isSelected 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`font-semibold text-sm truncate ${
                                      isSelected ? 'text-blue-600' : 'text-gray-900'
                                    }`}>
                                      {lesson.title}
                                    </h4>
                                    {!canAccess && (
                                      <span className="text-gray-400">🔒</span>
                                    )}
                                    {lesson.isPreview && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                        Free
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span className="capitalize">{lesson.type}</span>
                                    {lesson.duration && <span>{lesson.duration}</span>}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📚</div>
                      <p>No lessons available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'assignments' ? (
          renderAssignmentsTab()
        ) : (
          renderQuizzesTab()
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Student Reviews ({course.ratings?.length || 0})
          </h2>
          
          {course.ratings && course.ratings.length > 0 ? (
            <div className="space-y-4 mb-8">
              {course.ratings.map((rating, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-start mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                      {rating.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{rating.user?.name || 'Anonymous'}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 ml-13">{rating.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-8">
              No reviews yet. Be the first to review!
            </div>
          )}
          
          {/* Add Review Form */}
          {user && isEnrolled && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={review.rating}
                    onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5,4,3,2,1].map(num => (
                      <option key={num} value={num}>
                        {'★'.repeat(num)} {num} Star{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({...review, comment: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Share your experience with this course..."
                  ></textarea>
                </div>
                <button
                  onClick={handleReview}
                  disabled={submittingReview}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="border-t pt-6 text-center">
              <p className="text-gray-600 mb-4">Please login to enroll and leave a review</p>
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Login Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;