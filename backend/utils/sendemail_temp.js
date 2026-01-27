// utils/sendEmail.js
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



// Email templates
const emailTemplates = {
  teacherApproval: (teacherName) => ({
    subject: '🎉 Congratulations! Your Teacher Account Has Been Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .info-box { background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Dear ${teacherName},</h2>
            <p>We are excited to inform you that your teacher application has been <strong>approved</strong>!</p>
            
            <div class="info-box">
              <h3 style="color: #667eea; margin-top: 0;">🎯 What's Next?</h3>
              <ul>
                <li>You can now create and publish courses</li>
                <li>Access your teacher dashboard</li>
                <li>Start earning from your courses</li>
                <li>Join our community of educators</li>
              </ul>
            </div>
            
            <p><strong>Login to your account</strong> to get started:</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
              Go to Dashboard
            </a>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <h4>Need Help?</h4>
              <p>Check out our <a href="${process.env.FRONTEND_URL}/teacher-guide">Teacher Guide</a> or contact our support team.</p>
            </div>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Learning Platform Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),
  
  teacherRejection: (teacherName) => ({
    subject: 'Update on Your Teacher Application',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background-color: white; border-radius: 0 0 10px 10px; }
          .info-box { background-color: #fff8f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #333; margin: 0;">Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${teacherName},</h2>
            <p>Thank you for your interest in becoming a teacher on our platform.</p>
            
            <p>After careful review, we regret to inform you that your application <strong>has not been approved</strong> at this time.</p>
            
            <div class="info-box">
              <h3 style="color: #dc3545; margin-top: 0;">💡 Suggestions for Improvement:</h3>
              <ul>
                <li>Consider adding more experience to your CV</li>
                <li>Include relevant certifications or qualifications</li>
                <li>You may reapply after 30 days with updated information</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p style="margin-top: 30px;">
              Sincerely,<br>
              <strong>The Learning Platform Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),
  
  contactMessage: (name, message) => ({
    subject: 'Thank you for contacting us',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for reaching out to us. We have received your message:</p>
      <blockquote>${message}</blockquote>
      <p>Our team will get back to you within 24-48 hours.</p>
    `
  })
};

// Main sendEmail function (keeps backward compatibility)
const sendEmail = async ({ email, subject, message, template, templateData }) => {
  try {
    let mailOptions = {
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      to: email
    };

    // If using a template
    if (template && emailTemplates[template]) {
      const templateObj = emailTemplates[template](...templateData);
      mailOptions.subject = templateObj.subject;
      mailOptions.html = templateObj.html;
    } 
    // For backward compatibility
    else {
      mailOptions.subject = subject;
      mailOptions.text = message;
      mailOptions.html = message; // Optional: also include HTML version
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;