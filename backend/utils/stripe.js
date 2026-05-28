const Course = require('../models/Course');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith('your_') || key.trim() === '') {
      return null;
    }
    // Initialize stripe lazily to ensure dotenv has fully loaded
    stripeInstance = require('stripe')(key);
  }
  return stripeInstance;
};

const createCheckoutSession = async (course, student) => {
  try {
    const stripe = getStripe();
    
    if (stripe) {
      console.log('💳 Stripe is configured. Creating real Stripe Checkout session for:', course.title);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
        customer_email: student.email,
        metadata: {
          courseId: course._id.toString(),
          studentId: student._id.toString()
        },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description ? course.description.substring(0, 500) : 'Premium Course'
            },
            unit_amount: Math.round(course.price * 100) // Stripe expects price in cents
          },
          quantity: 1
        }]
      });
      return session;
    }
  } catch (error) {
    console.error('💥 Stripe Session creation failed. Falling back to local simulation:', error.message);
  }

  // Simulated fallback URL when Stripe isn't configured or fails
  console.log('ℹ️ Stripe key missing or offline. Redirecting to simulated sandbox checkout.');
  const mockSessionId = `sim_${Math.random().toString(36).substring(2, 15)}`;
  return {
    id: mockSessionId,
    url: `/payment/simulated-checkout?courseId=${course._id}&studentId=${student._id}&sessionId=${mockSessionId}`
  };
};

const fulfillEnrollment = async (courseId, studentId, stripeSessionId = null, paymentMethod = 'stripe') => {
  // 1. Find course and student
  const course = await Course.findById(courseId);
  const student = await User.findById(studentId);
  
  if (!course || !student) {
    throw new Error('Course or Student not found');
  }

  // 2. Check if already enrolled
  if (!student.enrolledCourses) student.enrolledCourses = [];
  const alreadyEnrolled = student.enrolledCourses.some(
    e => {
      const cId = e.course ? e.course.toString() : e.toString();
      return cId === courseId.toString();
    }
  );

  if (!alreadyEnrolled) {
    // 3. Add course to student's enrolled courses
    student.enrolledCourses.push({
      course: course._id,
      progress: 0,
      completed: false
    });
    await student.save();

    // 4. Add student to course's enrolled students
    if (!course.enrolledStudents) course.enrolledStudents = [];
    if (!course.enrolledStudents.includes(student._id)) {
      course.enrolledStudents.push(student._id);
      await course.save();
    }

    // 5. Create Transaction record (with 20% fee calculation)
    const amount = course.price;
    const adminFee = parseFloat((amount * 0.2).toFixed(2));
    const teacherEarnings = parseFloat((amount * 0.8).toFixed(2));

    await Transaction.create({
      student: student._id,
      teacher: course.instructor,
      course: course._id,
      amount,
      adminFee,
      teacherEarnings,
      stripeSessionId,
      status: 'completed',
      paymentMethod
    });

    console.log(`✅ Fulfill enrollment succeeded: Course "${course.title}" for Student <${student.email}>`);
  } else {
    console.log(`ℹ️ Student <${student.email}> is already enrolled in Course "${course.title}"`);
  }
};

module.exports = {
  createCheckoutSession,
  fulfillEnrollment
};