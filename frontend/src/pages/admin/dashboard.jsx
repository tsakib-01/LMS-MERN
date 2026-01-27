
  import { useState, useEffect } from 'react';

  const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    // Messages state
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);

    const CONTENT_API_URL = 'http://localhost:5000/api/content';
    const CONTACT_API_URL = 'http://localhost:5000/api/contact';
    const USERS_API_URL = 'http://localhost:5000/api/admin/users';

    // About Page Content
    const [aboutContent, setAboutContent] = useState({
      heroTitle: 'About Learning Platform',
      heroDescription: 'Empowering learners worldwide with high-quality, accessible education.',
      storyTitle: 'Our Story',
      storyParagraphs: [
        'Founded in 2020, Learning Platform was born from a simple idea...',
        'What started as a small team of passionate educators...',
        'Today, we\'re proud to offer hundreds of courses...',
        'Our commitment remains the same...'
      ],
      missionTitle: 'Our Mission',
      missionDescription: 'To democratize education by providing world-class learning experiences...',
      stats: [
        { number: '10K+', label: 'Active Students' },
        { number: '500+', label: 'Courses Available' },
        { number: '50+', label: 'Expert Instructors' },
        { number: '95%', label: 'Satisfaction Rate' }
      ],
      values: [
        { icon: '🎯', title: 'Excellence', description: 'We strive for excellence...' },
        { icon: '🤝', title: 'Community', description: 'Building a supportive learning...' },
        { icon: '💡', title: 'Innovation', description: 'Constantly evolving our platform...' },
        { icon: '🌍', title: 'Accessibility', description: 'Making quality education accessible...' }
      ]
    });

    // Contact Page Content
    const [contactContent, setContactContent] = useState({
      heroTitle: 'Get in Touch',
      heroDescription: 'Have questions? We\'d love to hear from you.',
      contactInfo: {
        email1: 'support@learning.com',
        email2: 'info@learning.com',
        phone: '+1 (555) 123-4567',
        phoneHours: 'Mon-Fri, 9AM-6PM EST',
        address1: '123 Learning Street',
        address2: 'Education City, EC 12345',
        liveChatAvailability: 'Available 24/7'
      },
      faqs: [
        { question: 'How do I enroll in a course?', answer: 'Simply browse our courses...' },
        { question: 'Can I get a refund?', answer: 'Yes! We offer a 30-day money-back guarantee...' },
        { question: 'Do you offer certificates?', answer: 'Yes, you\'ll receive a certificate...' },
        { question: 'How long do I have access?', answer: 'Once enrolled, you have lifetime access...' }
      ]
    });

    // Fetch content from backend on mount
    useEffect(() => {
      fetchContent();
    }, []);

    // Fetch data when respective tabs are active
    useEffect(() => {
      if (activeTab === 'messages') {
        fetchMessages();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }, [activeTab]);

    const fetchContent = async () => {
      try {
        const response = await fetch(`${CONTENT_API_URL}/pages`);
        const data = await response.json();
        
        if (data.success) {
          if (data.data.about) setAboutContent(data.data.about);
          if (data.data.contact) setContactContent(data.data.contact);
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
      }
    };

    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(USERS_API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const response = await fetch(`${CONTACT_API_URL}/messages`);
        const data = await response.json();
        
        if (data.success) {
          setMessages(data.data);
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

// In your dashboard.jsx file, find the existing handleUserAction function
// Replace it with this:

const handleUserAction = async (userId, action) => {
  const actionText = action === 'approve' ? 'approve' : 'reject';
  if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${USERS_API_URL}/${userId}/${action}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Action response:', data); // For debugging
    
    if (data.success) {
      // Enhanced success message with email status
      let successMsg = `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`;
      
      if (data.emailSent) {
        successMsg += ' ✓ Email sent';
      } else if (data.user && data.user.email) {
        successMsg += ' (Email failed to send)';
      }
      
      setSuccess(successMsg);
      setTimeout(() => setSuccess(''), 5000);
      fetchUsers(); // Refresh the list
    } else {
      setError(data.message || `Failed to ${actionText} user`);
      setTimeout(() => setError(''), 3000);
    }
  } catch (err) {
    console.error('Action error:', err);
    setError(`Failed to ${actionText} user: ${err.message}`);
    setTimeout(() => setError(''), 3000);
  }
};

    const deleteMessage = async (id) => {
      if (!window.confirm('Are you sure you want to delete this message?')) return;

      try {
        const response = await fetch(`${CONTACT_API_URL}/messages/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          setMessages(messages.filter(msg => msg._id !== id));
          setSuccess('Message deleted successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete message');
        setTimeout(() => setError(''), 3000);
      }
    };

    const handleSave = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const content = activeTab === 'about' ? aboutContent : contactContent;
        
        const response = await fetch(`${CONTENT_API_URL}/pages/${activeTab}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content)
        });

        const data = await response.json();

        if (data.success) {
          setSuccess(`${activeTab === 'about' ? 'About' : 'Contact'} page updated successfully!`);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('Failed to update content');
        }
      } catch (err) {
        setError('Failed to save changes');
        console.error('Save error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Update handlers for About page
    const updateAboutField = (field, value) => {
      setAboutContent({ ...aboutContent, [field]: value });
    };

    const updateStoryParagraph = (index, value) => {
      const newParagraphs = [...aboutContent.storyParagraphs];
      newParagraphs[index] = value;
      setAboutContent({ ...aboutContent, storyParagraphs: newParagraphs });
    };

    const updateStat = (index, field, value) => {
      const newStats = [...aboutContent.stats];
      newStats[index] = { ...newStats[index], [field]: value };
      setAboutContent({ ...aboutContent, stats: newStats });
    };

    const updateValue = (index, field, value) => {
      const newValues = [...aboutContent.values];
      newValues[index] = { ...newValues[index], [field]: value };
      setAboutContent({ ...aboutContent, values: newValues });
    };

    // Update handlers for Contact page
    const updateContactField = (field, value) => {
      setContactContent({ ...contactContent, [field]: value });
    };

    const updateContactInfo = (field, value) => {
      setContactContent({
        ...contactContent,
        contactInfo: { ...contactContent.contactInfo, [field]: value }
      });
    };

    const updateFAQ = (index, field, value) => {
      const newFAQs = [...contactContent.faqs];
      newFAQs[index] = { ...newFAQs[index], [field]: value };
      setContactContent({ ...contactContent, faqs: newFAQs });
    };

    // const pendingUsers = users.filter(u => !u.isActive && u.role !== 'Student');
    // Fix: Explicitly look for 'Teacher' role, OR users who have uploaded a CV
    const pendingUsers = users.filter(u => !u.isActive && (u.role === 'Teacher' || u.cv));
    const activeUsers = users.filter(u => u.isActive);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-purple-100">Manage Users, Content and Messages</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Notifications */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
              <span>✓ {success}</span>
              <button onClick={() => setSuccess('')} className="font-bold hover:text-green-900">×</button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
              <span>✗ {error}</span>
              <button onClick={() => setError('')} className="font-bold hover:text-red-900">×</button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex border-b overflow-x-auto">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 User Management
                {pendingUsers.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 About Page
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📧 Contact Page
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 font-semibold transition relative whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📥 Inbox 
                {messages.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Pending Approvals */}
              {pendingUsers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-orange-500">
                  <div className="p-6 border-b border-gray-200 bg-orange-50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="text-2xl mr-2">⏳</span>
                      Pending Approvals
                      <span className="ml-3 bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                        {pendingUsers.length}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b">Date</th>
                          <th className="p-4 font-semibold border-b">Name</th>
                          <th className="p-4 font-semibold border-b">Email</th>
                          <th className="p-4 font-semibold border-b">Role</th>
                          <th className="p-4 font-semibold border-b">CV</th>
                          <th className="p-4 font-semibold border-b text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-medium text-gray-900">{user.name}</td>
                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              {user.cv ? (
                                <a 
                                  href={`http://localhost:5000/${user.cv}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  View CV
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No CV</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => handleUserAction(user._id, 'approve')}
                                className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm transition font-medium"
                              >
                                ✓ Approve
                              </button>
                              <button 
                                onClick={() => handleUserAction(user._id, 'reject')}
                                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm transition font-medium"
                              >
                                ✗ Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Active Users */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">All Active Users</h3>
                  <button 
                    onClick={fetchUsers}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {usersLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : activeUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">👤</div>
                    <p>No active users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b">Joined</th>
                          <th className="p-4 font-semibold border-b">Name</th>
                          <th className="p-4 font-semibold border-b">Email</th>
                          <th className="p-4 font-semibold border-b">Role</th>
                          <th className="p-4 font-semibold border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-medium text-gray-900">{user.name}</td>
                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                user.role === 'teacher' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Received Messages</h3>
                  <button 
                    onClick={fetchMessages}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {messagesLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No messages found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b">Date</th>
                          <th className="p-4 font-semibold border-b">Name</th>
                          <th className="p-4 font-semibold border-b">Subject</th>
                          <th className="p-4 font-semibold border-b">Message</th>
                          <th className="p-4 font-semibold border-b text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {messages.map((msg) => (
                          <tr key={msg._id} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-gray-900">{msg.name}</div>
                              <div className="text-sm text-gray-500">{msg.email}</div>
                            </td>
                            <td className="p-4 font-medium text-gray-700">
                              {msg.subject || 'No Subject'}
                            </td>
                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                              {msg.message}
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => deleteMessage(msg._id)}
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Page Editor */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={aboutContent.heroTitle}
                      onChange={(e) => updateAboutField('heroTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={aboutContent.heroDescription}
                      onChange={(e) => updateAboutField('heroDescription', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Statistics</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {aboutContent.stats.map((stat, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => updateStat(idx, 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStat(idx, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Story</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
                    <input
                      type="text"
                      value={aboutContent.storyTitle}
                      onChange={(e) => updateAboutField('storyTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {aboutContent.storyParagraphs.map((para, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paragraph {idx + 1}
                      </label>
                      <textarea
                        value={para}
                        onChange={(e) => updateStoryParagraph(idx, e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Values Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Core Values</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {aboutContent.values.map((value, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                        <input
                          type="text"
                          value={value.icon}
                          onChange={(e) => updateValue(idx, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={value.title}
                          onChange={(e) => updateValue(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                          value={value.description}
                          onChange={(e) => updateValue(idx, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mission Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
                    <input
                      type="text"
                      value={aboutContent.missionTitle}
                      onChange={(e) => updateAboutField('missionTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mission Description</label>
                    <textarea
                      value={aboutContent.missionDescription}
                      onChange={(e) => updateAboutField('missionDescription', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Page Editor */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={contactContent.heroTitle}
                      onChange={(e) => updateContactField('heroTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={contactContent.heroDescription}
                      onChange={(e) => updateContactField('heroDescription', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email 1</label>
                    <input
                      type="email"
                      value={contactContent.contactInfo.email1}
                      onChange={(e) => updateContactInfo('email1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email 2</label>
                    <input
                      type="email"
                      value={contactContent.contactInfo.email2}
                      onChange={(e) => updateContactInfo('email2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={contactContent.contactInfo.phone}
                      onChange={(e) => updateContactInfo('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Hours</label>
                    <input
                      type="text"
                      value={contactContent.contactInfo.phoneHours}
                      onChange={(e) => updateContactInfo('phoneHours', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={contactContent.contactInfo.address1}
                      onChange={(e) => updateContactInfo('address1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={contactContent.contactInfo.address2}
                      onChange={(e) => updateContactInfo('address2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Live Chat Availability</label>
                    <input
                      type="text"
                      value={contactContent.contactInfo.liveChatAvailability}
                      onChange={(e) => updateContactInfo('liveChatAvailability', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {contactContent.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question {idx + 1}
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Only show for About and Contact tabs */}
          {(activeTab === 'about' || activeTab === 'contact') && (
            <div className="sticky bottom-6 bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Make sure to save your changes before leaving this page
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default Dashboard;