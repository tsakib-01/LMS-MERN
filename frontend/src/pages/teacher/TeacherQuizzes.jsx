// pages/teacher/TeacherQuizzes.jsx
import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── helpers ───────────────────────────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTION FORM  (shared by Create + Edit)
// ══════════════════════════════════════════════════════════════════════════════
const QuestionForm = ({ onClose, onAdd }) => {
  const [question, setQuestion]         = useState('');
  const [options, setOptions]           = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (options.some(o => !o.trim())) { alert('Please fill in all options'); return; }
    onAdd({ question, options, correctAnswer });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">Add Question</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <textarea required value={question} onChange={e => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3} placeholder="Enter your question" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options — select the correct answer
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="w-8 h-10 flex items-center justify-center bg-gray-100 rounded font-semibold text-sm flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <input type="text" required value={opt}
                  onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                  className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                <input type="radio" name="correct" checked={correctAnswer === i}
                  onChange={() => setCorrectAnswer(i)} className="w-5 h-5 accent-green-600" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">Add Question</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CREATE QUIZ MODAL
// ══════════════════════════════════════════════════════════════════════════════
const CreateQuizModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData]         = useState({ title: '', description: '', course: '', duration: 30, passingScore: 70 });
  const [questions, setQuestions]       = useState([]);
  const [courses, setCourses]           = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    fetch(`${API}/api/teacher/courses`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || []))
      .catch(() => {}).finally(() => setCoursesLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course)      { alert('Please select a course'); return; }
    if (!questions.length)     { alert('Please add at least one question'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/teacher/quizzes`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...formData, questions }) });
      const data = await res.json();
      if (res.ok) onSuccess();
      else alert(data.message || 'Failed to create quiz');
    } catch (_) { alert('Failed to create quiz'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
              <input type="text" required value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Enter quiz title" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
              <select required value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">Select a course</option>
                {coursesLoading ? <option disabled>Loading...</option> :
                 courses.length === 0 ? <option disabled>No courses — create one first</option> :
                 courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" required min="1" value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
              <input type="number" required min="0" max="100" value={formData.passingScore}
                onChange={e => setFormData({ ...formData, passingScore: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Questions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
              <button type="button" onClick={() => setShowQuestionForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-semibold">
                + Add Question
              </button>
            </div>
            {questions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">No questions yet. Click "Add Question" to start.</div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionRow key={i} q={q} index={i} onRemove={() => setQuestions(questions.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving || courses.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Quiz'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">Cancel</button>
          </div>
        </form>

        {showQuestionForm && (
          <QuestionForm onClose={() => setShowQuestionForm(false)} onAdd={q => { setQuestions([...questions, q]); setShowQuestionForm(false); }} />
        )}
      </div>
    </div>
  );
};

// ── Shared question display row ───────────────────────────────────────────────
const QuestionRow = ({ q, index, onRemove, onEdit }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 mb-2 text-sm">{index + 1}. {q.question}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {q.options.map((opt, i) => (
            <div key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === q.correctAnswer ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-white border border-gray-100 text-gray-600'}`}>
              {String.fromCharCode(65 + i)}. {opt}
              {i === q.correctAnswer && <span className="ml-1">✓</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-lg px-1 rounded hover:bg-red-50 transition">✕</button>
        )}
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// EDIT QUIZ MODAL
// ══════════════════════════════════════════════════════════════════════════════
const EditQuizModal = ({ quizId, onClose, onSuccess }) => {
  const [formData, setFormData]           = useState(null);
  const [questions, setQuestions]         = useState([]);
  const [courses, setCourses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQIndex, setEditingQIndex] = useState(null); // index of question being edited

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`${API}/api/teacher/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/teacher/courses`,           { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([quizData, courseData]) => {
      if (quizData.success) {
        const q = quizData.quiz;
        setFormData({ title: q.title, description: q.description, course: q.course?._id || q.course, duration: q.duration, passingScore: q.passingScore });
        setQuestions(q.questions || []);
      }
      setCourses(courseData.courses || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!questions.length) { alert('Please add at least one question'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/teacher/quizzes/${quizId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ...formData, questions }) });
      const data = await res.json();
      if (res.ok) onSuccess();
      else alert(data.message || 'Failed to update quiz');
    } catch (_) { alert('Failed to update quiz'); }
    finally { setSaving(false); }
  };

  // Handle inline edit of an existing question
  const handleEditQuestion = (updatedQ) => {
    const next = [...questions];
    next[editingQIndex] = updatedQ;
    setQuestions(next);
    setEditingQIndex(null);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    </div>
  );

  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
              <input type="text" required value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select required value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">Select a course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" required min="1" value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
              <input type="number" required min="0" max="100" value={formData.passingScore}
                onChange={e => setFormData({ ...formData, passingScore: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Questions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
              <button type="button" onClick={() => { setEditingQIndex(null); setShowQuestionForm(true); }}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-semibold">
                + Add Question
              </button>
            </div>
            {questions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">No questions yet.</div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionRow key={i} q={q} index={i}
                    onRemove={() => setQuestions(questions.filter((_, j) => j !== i))}
                    onEdit={(idx) => { setEditingQIndex(idx); setShowQuestionForm(true); }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">Cancel</button>
          </div>
        </form>

        {/* Add or Edit question */}
        {showQuestionForm && (
          <QuestionForm
            onClose={() => { setShowQuestionForm(false); setEditingQIndex(null); }}
            onAdd={q => {
              if (editingQIndex !== null) {
                handleEditQuestion(q);
              } else {
                setQuestions([...questions, q]);
              }
              setShowQuestionForm(false);
              setEditingQIndex(null);
            }}
            // Pre-fill when editing an existing question
            initialData={editingQIndex !== null ? questions[editingQIndex] : null}
          />
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ RESULTS MODAL
// ══════════════════════════════════════════════════════════════════════════════
const QuizResultsModal = ({ quiz, onClose }) => {
  const [attempts, setAttempts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/teacher/quizzes/${quiz._id}/results`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(d => setAttempts(d.attempts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quiz._id]);

  // Stats
  const total     = attempts.length;
  const passed    = attempts.filter(a => a.passed).length;
  const avgScore  = total ? (attempts.reduce((s, a) => s + a.score, 0) / total).toFixed(1) : '—';
  const passRate  = total ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p className="text-blue-200 text-sm mt-1">{quiz.course?.title}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
          </div>
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Total Attempts', value: total },
              { label: 'Passed',         value: passed },
              { label: 'Pass Rate',      value: `${passRate}%` },
              { label: 'Avg Score',      value: `${avgScore}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
              <p className="text-gray-400">Loading results...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-500 font-semibold">No attempts yet</p>
              <p className="text-gray-400 text-sm mt-1">Results will appear here once students take the quiz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Student Attempts</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  Passing score: {quiz.passingScore}%
                </span>
              </div>

              {attempts.map((attempt, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {attempt.student?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{attempt.student?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{attempt.student?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {Math.round(attempt.score)}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {attempt.passed ? '✓ Passed' : '✕ Failed'}
                      </span>
                      <span className="text-gray-400 text-sm">{expandedIdx === i ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded: per-question breakdown */}
                  {expandedIdx === i && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">Answer Breakdown</p>
                      <div className="space-y-2">
                        {quiz.questions?.map((q, qi) => {
                          const selected = attempt.answers?.[qi];
                          const isCorrect = selected === q.correctAnswer;
                          return (
                            <div key={qi} className={`rounded-xl p-3 border text-sm ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                              <p className="font-medium text-gray-800 mb-1.5">{qi + 1}. {q.question}</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {q.options.map((opt, oi) => {
                                  const isSelected = oi === selected;
                                  const isAnswer   = oi === q.correctAnswer;
                                  return (
                                    <div key={oi} className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1
                                      ${isAnswer   ? 'bg-green-200 text-green-900' : ''}
                                      ${isSelected && !isAnswer ? 'bg-red-200 text-red-900' : ''}
                                      ${!isSelected && !isAnswer ? 'bg-white text-gray-600' : ''}`}>
                                      {String.fromCharCode(65 + oi)}. {opt}
                                      {isAnswer   && <span className="ml-auto">✓</span>}
                                      {isSelected && !isAnswer && <span className="ml-auto">✗</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const TeacherQuizzes = () => {
  const [quizzes, setQuizzes]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editQuizId, setEditQuizId]         = useState(null);   // quiz._id to edit
  const [resultsQuiz, setResultsQuiz]       = useState(null);   // full quiz object for results

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/teacher/quizzes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err) { console.error('Error fetching quizzes:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`${API}/api/teacher/quizzes/${quizId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) fetchQuizzes();
      else { const d = await res.json(); alert(d.message || 'Failed to delete'); }
    } catch (_) { alert('Failed to delete quiz'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-500 mt-1">Create and manage quizzes for your courses</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2 shadow-sm">
            <span>➕</span> Create Quiz
          </button>
        </div>

        {/* Quiz list */}
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
            <p className="text-gray-500 mb-6">Create your first quiz to start assessing students.</p>
            <button onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold">
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📚 {quiz.course?.title || 'N/A'}</span>
                      <span>❓ {quiz.questions?.length || 0} questions</span>
                      <span>⏱️ {quiz.duration} min</span>
                      <span>📊 {quiz.attempts?.length || 0} attempts</span>
                      <span>🎯 Pass: {quiz.passingScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setResultsQuiz(quiz)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-semibold"
                    >
                      📊 Results
                    </button>
                    <button
                      onClick={() => setEditQuizId(quiz._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm font-semibold"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuizModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchQuizzes(); }} />
      )}
      {editQuizId && (
        <EditQuizModal quizId={editQuizId} onClose={() => setEditQuizId(null)} onSuccess={() => { setEditQuizId(null); fetchQuizzes(); }} />
      )}
      {resultsQuiz && (
        <QuizResultsModal quiz={resultsQuiz} onClose={() => setResultsQuiz(null)} />
      )}
    </div>
  );
};

export default TeacherQuizzes;