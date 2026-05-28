// utils/sendemail_temp.js
const nodemailer = require('nodemailer');

// Email templates
const emailTemplates = {

  // ── Existing: Teacher approved ───────────────────────────────────────────
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
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The SkillBridge Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ── Existing: Teacher rejected ───────────────────────────────────────────
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
              <strong>The SkillBridge Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ── Existing: Admin-created teacher invite ───────────────────────────────
  teacherInvite: (teacherName, inviteLink) => ({
    subject: '🎓 You have been invited to join SkillBridge as a Teacher',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 35px 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 10px 0; }
          .info-box { background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 24px 0; }
          .warning-box { background-color: #fffbea; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 14px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SkillBridge! 🎓</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0;">You've been invited as a Teacher</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0;">Hello ${teacherName},</h2>
            <p>
              The SkillBridge admin has created a teacher account for you.
              To get started, you need to <strong>set your own password</strong> by clicking the button below.
            </p>
            <div class="info-box">
              <h3 style="color: #667eea; margin-top: 0;">🚀 What you can do as a Teacher:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Create and publish courses</li>
                <li>Manage lessons, assignments, and quizzes</li>
                <li>Track student progress</li>
                <li>Issue certificates upon completion</li>
              </ul>
            </div>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" class="button">✅ Set My Password</a>
            </p>
            <div class="warning-box">
              ⏰ <strong>This link expires in 48 hours.</strong>
              If it expires, please contact your admin to resend the invite.
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-family: monospace;">
              ${inviteLink}
            </p>
            <div class="footer">
              <p>If you did not expect this email, you can safely ignore it. No account will be activated without setting a password.</p>
              <p>— The SkillBridge Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ── Existing: Contact message confirmation ───────────────────────────────
  contactMessage: (name, message) => ({
    subject: 'Thank you for contacting us',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for reaching out to us. We have received your message:</p>
      <blockquote>${message}</blockquote>
      <p>Our team will get back to you within 24-48 hours.</p>
    `
  }),

  // ── Certificate issued congratulation ────────────────────────────────────
  certificateIssued: (studentName, courseTitle, certNumber, verificationCode, completionDate, grade, instructorName) => ({
    subject: `🎓 Congratulations! Your Certificate for "${courseTitle}" is Ready`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Certificate Issued</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:620px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:48px 32px;text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">🏆</div>
            <h1 style="color:#ffffff;margin:0 0 8px;font-size:28px;font-weight:800;">Congratulations, ${studentName}!</h1>
            <p style="color:rgba(255,255,255,0.9);margin:0;font-size:16px;">Your certificate of completion has been issued</p>
          </div>
          <div style="padding:40px 32px;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
              We're thrilled to let you know that your certificate for completing
              <strong style="color:#1f2937;">"${courseTitle}"</strong> has been officially issued.
              This is a huge achievement — well done! 🎉
            </p>
            <div style="border:2px solid #fde68a;border-radius:12px;padding:28px;background:linear-gradient(135deg,#fffbeb,#fef3c7);margin-bottom:28px;text-align:center;">
              <div style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#d97706;font-weight:700;margin-bottom:10px;">Certificate of Completion</div>
              <div style="font-size:24px;font-weight:800;color:#1f2937;margin-bottom:4px;">${studentName}</div>
              <div style="font-size:13px;color:#6b7280;margin-bottom:12px;">has successfully completed</div>
              <div style="font-size:18px;font-weight:700;color:#1e40af;margin-bottom:24px;">"${courseTitle}"</div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="text-align:center;padding:0 8px;">
                    <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Date</div>
                    <div style="font-size:13px;font-weight:600;color:#374151;">${completionDate}</div>
                  </td>
                  <td style="text-align:center;padding:0 8px;">
                    <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Grade</div>
                    <div style="font-size:13px;font-weight:600;color:#374151;">${grade}</div>
                  </td>
                  <td style="text-align:center;padding:0 8px;">
                    <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Instructor</div>
                    <div style="font-size:13px;font-weight:600;color:#374151;">${instructorName}</div>
                  </td>
                </tr>
              </table>
              <div style="background:#ffffff;border:1px solid #fde68a;border-radius:8px;padding:10px 16px;display:inline-block;">
                <span style="font-size:11px;color:#9ca3af;">Certificate No: </span>
                <span style="font-size:13px;font-weight:700;color:#d97706;font-family:monospace;">${certNumber}</span>
              </div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#166534;">🔒 Your Verification Code</p>
              <p style="margin:0 0 8px;font-size:26px;font-weight:800;color:#16a34a;letter-spacing:5px;font-family:monospace;">${verificationCode}</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">Share this code with anyone who wants to verify your certificate's authenticity.</p>
            </div>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${process.env.FRONTEND_URL}/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;">
                View My Certificate →
              </a>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0;">
              You can find your certificate anytime in your <strong>student dashboard</strong> under the <strong>Certificates</strong> tab. Keep learning and growing! 🚀
            </p>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#9ca3af;">© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#d1d5db;">This is an automated message — please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// ── Existing sendEmail (unchanged — used for teacher emails) ─────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ email, subject, message, template, templateData }) => {
  try {
    let mailOptions = {
      from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
      to: email
    };

    if (template && emailTemplates[template]) {
      const templateObj = emailTemplates[template](...templateData);
      mailOptions.subject = templateObj.subject;
      mailOptions.html = templateObj.html;
    } else {
      mailOptions.subject = subject;
      mailOptions.text = message;
      mailOptions.html = message;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// ── NEW: sendCertificateEmail — fresh transporter so .env is always read ─────
const sendCertificateEmail = async (studentEmail, studentName, courseTitle, certNumber, verificationCode, completionDate, grade, instructorName) => {
  try {
    // Fresh transporter created at call time — guaranteed to read current .env
    const certTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📧 Sending certificate email via:', process.env.EMAIL_USER);

    const templateObj = emailTemplates.certificateIssued(
      studentName, courseTitle, certNumber,
      verificationCode, completionDate, grade, instructorName
    );

    const info = await certTransporter.sendMail({
      from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: templateObj.subject,
      html: templateObj.html
    });

    console.log('✅ Certificate email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Certificate email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
module.exports.sendCertificateEmail = sendCertificateEmail;