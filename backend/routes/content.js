const express = require('express');
const router = express.Router();

// In-memory storage (replace with MongoDB in production)
let pageContent = {
  about: {
    heroTitle: 'About Learning Platform',
    heroDescription: 'Empowering learners worldwide with high-quality, accessible education. We\'re on a mission to make learning engaging, effective, and available to everyone.',
    storyTitle: 'Our Story',
    storyParagraphs: [
      'Founded in 2020, Learning Platform was born from a simple idea: education should be accessible, engaging, and effective for everyone, regardless of their background or location.',
      'What started as a small team of passionate educators and developers has grown into a thriving community of learners and instructors from around the world.',
      'Today, we\'re proud to offer hundreds of courses across diverse subjects, helping thousands of students achieve their learning goals and advance their careers.',
      'Our commitment remains the same: to provide the highest quality educational content and the best learning experience possible.'
    ],
    missionTitle: 'Our Mission',
    missionDescription: 'To democratize education by providing world-class learning experiences that are accessible, affordable, and adaptable to every learner\'s needs. We believe that everyone deserves the opportunity to learn, grow, and achieve their full potential.',
    stats: [
      { number: '10K+', label: 'Active Students' },
      { number: '500+', label: 'Courses Available' },
      { number: '50+', label: 'Expert Instructors' },
      { number: '95%', label: 'Satisfaction Rate' }
    ],
    values: [
      {
        icon: '🎯',
        title: 'Excellence',
        description: 'We strive for excellence in everything we do, from course content to student support.'
      },
      {
        icon: '🤝',
        title: 'Community',
        description: 'Building a supportive learning community where everyone can thrive together.'
      },
      {
        icon: '💡',
        title: 'Innovation',
        description: 'Constantly evolving our platform with the latest educational technologies.'
      },
      {
        icon: '🌍',
        title: 'Accessibility',
        description: 'Making quality education accessible to learners worldwide.'
      }
    ]
  },
  contact: {
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
      {
        question: 'How do I enroll in a course?',
        answer: 'Simply browse our courses, select one you like, and click "Enroll Now". You\'ll be guided through the registration process.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Yes! We offer a 30-day money-back guarantee for all our courses. No questions asked.'
      },
      {
        question: 'Do you offer certificates?',
        answer: 'Yes, you\'ll receive a certificate of completion for each course you finish successfully.'
      },
      {
        question: 'How long do I have access?',
        answer: 'Once enrolled, you have lifetime access to the course materials and all future updates.'
      }
    ]
  }
};

// In-memory storage for contact messages
let contactMessages = [];

// ========================================
// CONTACT MESSAGE ROUTES (NEW)
// ========================================

// POST - Submit a contact message
router.post('/messages', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create contact message object
    const contactMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : 'No subject',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    // Store the message
    contactMessages.push(contactMessage);

    console.log('✅ New contact message received:', {
      from: name,
      email: email,
      subject: subject || 'No subject'
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      data: contactMessage
    });

  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// GET - Get all contact messages (for admin)
router.get('/messages', (req, res) => {
  try {
    res.json({
      success: true,
      count: contactMessages.length,
      data: contactMessages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// DELETE - Delete a contact message (for admin)
router.delete('/messages/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = contactMessages.length;
    contactMessages = contactMessages.filter(msg => msg.id !== id);
    
    if (contactMessages.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// PAGE CONTENT ROUTES (EXISTING)
// ========================================

// GET - Get all page content
router.get('/pages', (req, res) => {
  try {
    res.json({
      success: true,
      data: pageContent
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET - Get specific page content
router.get('/pages/:page', (req, res) => {
  try {
    const { page } = req.params;
    
    if (!pageContent[page]) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.json({
      success: true,
      data: pageContent[page]
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// PUT - Update page content
router.put('/pages/:page', (req, res) => {
  try {
    const { page } = req.params;
    
    if (!pageContent[page]) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Update the page content
    pageContent[page] = req.body;

    console.log(`✅ ${page.charAt(0).toUpperCase() + page.slice(1)} page content updated`);

    res.json({
      success: true,
      message: `${page.charAt(0).toUpperCase() + page.slice(1)} page updated successfully`,
      data: pageContent[page]
    });
  } catch (error) {
    console.error('Error updating page content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;