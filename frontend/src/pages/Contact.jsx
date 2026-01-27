import { useState, useEffect } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dynamic contact content from backend
  const [contactContent, setContactContent] = useState({
    heroTitle: 'Get in Touch',
    heroDescription: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
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
      { question: 'How do I enroll in a course?', answer: 'Simply browse our courses, select one you like, and click "Enroll Now". You\'ll be guided through the registration process.' },
      { question: 'Can I get a refund?', answer: 'Yes! We offer a 30-day money-back guarantee for all our courses. No questions asked.' },
      { question: 'Do you offer certificates?', answer: 'Yes, you\'ll receive a certificate of completion for each course you finish successfully.' },
      { question: 'How long do I have access?', answer: 'Once enrolled, you have lifetime access to the course materials and all future updates.' }
    ]
  });

  // Fetch contact page content on mount
  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/content/pages/contact');
        const data = await response.json();
        
        if (data.success) {
          setContactContent(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch contact content:', err);
      }
    };

    fetchContactContent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Make the POST request to your backend
      const response = await fetch('http://localhost:5000/api/content/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Success!
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      } else {
        // Backend returned an error
        setError(data.message || 'Failed to send message.');
      }

    } catch (err) {
      // Network error (Server not running, wrong URL, etc.)
      console.error(err);
      setError('Server error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">{contactContent.heroTitle}</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            {contactContent.heroDescription}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                <p className="font-semibold">Thank you for your message!</p>
                <p className="text-sm">We'll get back to you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                  required
                ></textarea>
              </div>

              {/* Show Error if any */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-4 rounded-lg font-semibold transition shadow-lg ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                We're here to help and answer any questions you might have. We look forward to hearing from you!
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">{contactContent.contactInfo.email1}</p>
                  <p className="text-gray-600">{contactContent.contactInfo.email2}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📞</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600">{contactContent.contactInfo.phone}</p>
                  <p className="text-gray-600">{contactContent.contactInfo.phoneHours}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600">{contactContent.contactInfo.address1}</p>
                  <p className="text-gray-600">{contactContent.contactInfo.address2}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-gray-600">{contactContent.contactInfo.liveChatAvailability}</p>
                  <button className="text-green-600 hover:text-green-700 font-semibold mt-1">
                    Start Chat →
                  </button>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition">
                  <span className="text-xl">𝕏</span>
                </a>
                <a href="#" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition">
                  <span className="text-xl">f</span>
                </a>
                <a href="#" className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition">
                  <span className="text-xl">in</span>
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition">
                  <span className="text-xl">IG</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {contactContent.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;