const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/html-escape');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send new lead notification to company
const sendNewLeadNotification = async (lead) => {
  // Escape all user-supplied values to prevent HTML injection (XSS)
  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safePhone = escapeHtml(lead.phone);
  const safeCompany = escapeHtml(lead.company);
  const safeInterest = Array.isArray(lead.interest) 
    ? lead.interest.map(escapeHtml).join(', ') 
    : escapeHtml(lead.interest);

  const mailOptions = {
    from: `"Material Solutions" <${process.env.EMAIL_USER}>`,
    to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
    subject: `🔔 New Lead: ${safeName}${safeCompany ? ` from ${safeCompany}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Lead Received</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ''}
          ${safeInterest ? `<p><strong>Interest:</strong> ${safeInterest}</p>` : ''}
          <p><strong>Score:</strong> ${lead.score || 0}</p>
          <p><strong>Status:</strong> ${escapeHtml(lead.status) || 'new'}</p>
        </div>
        <p style="margin-top: 20px; color: #6b7280;">
          Log in to Mission Control to follow up on this lead.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ New lead notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending lead notification:', error);
    throw error;
  }
};

// Send welcome email to new lead
const sendWelcomeEmail = async (lead) => {
  // Escape user-supplied values to prevent HTML injection
  const safeName = escapeHtml(lead.name);
  const safeEmail = lead.email; // Used for 'to' field, not HTML content

  const mailOptions = {
    from: `"Material Solutions" <${process.env.EMAIL_USER}>`,
    to: safeEmail,
    subject: 'Thank You for Your Interest in Material Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Hello ${safeName},</h2>
        <p>Thank you for your interest in Material Solutions!</p>
        <p>We specialize in reconditioned forklifts for narrow aisle applications and have been serving businesses across NJ, Eastern PA, and NYC for 29 years.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What Sets Us Apart:</h3>
          <ul>
            <li>Fully reconditioned equipment with warranty coverage</li>
            <li>90-day full warranty, 6 months on major components, 1 year on battery & charger</li>
            <li>Extensive inventory of Raymond, Toyota, and Crown forklifts</li>
            <li>OSHA training and wire-guided system installation available</li>
          </ul>
        </div>

        <p>Our team will be in touch with you shortly. If you have any immediate questions, feel free to reply to this email or give us a call.</p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong>The Material Solutions Team</strong>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server ready');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

// Generic send email function for drip campaigns
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Material Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendNewLeadNotification,
  sendWelcomeEmail,
  testEmailConfig,
  sendEmail
};
