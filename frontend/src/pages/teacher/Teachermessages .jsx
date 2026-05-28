import { useState, useEffect } from 'react';
import { getMessages, replyToMessage, markMessageAsRead } from '../../services/teacherService';

const TeacherMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await getMessages(filters);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;
    try {
      await replyToMessage(messageId, replyText);
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error replying to message:', error);
      alert('Failed to send reply');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800'
    };
    return badges[status] || badges.unread;
  };

  const getTypeBadge = (type) => {
    const badges = {
      question: { bg: 'bg-purple-100 text-purple-800', icon: '❓' },
      feedback: { bg: 'bg-orange-100 text-orange-800', icon: '💬' },
      general: { bg: 'bg-blue-100 text-blue-800', icon: '📧' }
    };
    return badges[type] || badges.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Messages</h1>
        <p className="mt-2 text-gray-600">Respond to student questions and feedback</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'read'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Read
        </button>
        <button
          onClick={() => setFilter('replied')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'replied'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Replied
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">
                      {message.sender.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{message.sender.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusBadge(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getTypeBadge(message.type).bg}`}>
                        {getTypeBadge(message.type).icon} {message.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{message.sender.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                <p className="text-gray-700">{message.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">Course:</span> {message.course.title}
                </p>
              </div>

              {/* Replies */}
              {message.replies && message.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                  {message.replies.map((reply, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">You replied:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {message.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(message._id)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(selectedMessage === message._id ? null : message._id)}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  {selectedMessage === message._id ? 'Cancel Reply' : 'Reply'}
                </button>
              </div>

              {/* Reply Form */}
              {selectedMessage === message._id && (
                <div className="mt-4 pt-4 border-t">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(message._id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500">No messages found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessages;