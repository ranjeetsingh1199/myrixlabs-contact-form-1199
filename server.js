const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Contact form endpoint
app.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    // Check if environment variables are set
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.EMAIL_TO
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Email configuration missing. Please check environment variables.',
      });
    }

    // Create a fresh SMTP transporter for each email to avoid connection issues
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      rateDelta: 20000,
      rateLimit: 5,
    });

    const fullName = `${firstName} ${lastName}`;
    const emailContent = `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Message: ${message}

Timestamp: ${new Date().toLocaleString()}
    `.trim();

    const info = await transporter.sendMail({
      from: `"${fullName}" <${email}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Contact Form: New Message from ${fullName}`,
      text: emailContent,
      headers: { 'X-Mailer': 'MyrixLabs Contact Form' },
    });
    transporter.close();

    res.json({
      success: true,
      message: 'Message sent!',
      messageId: info.messageId,
    });
  } catch (error) {
    try {
      // eslint-disable-next-line no-undef
      if (typeof transporter !== 'undefined' && transporter) {
        // eslint-disable-next-line no-undef
        transporter.close();
      }
    } catch (closeError) {
      // Ignore close errors
    }
    console.error('Email sending error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MyrixLabs Contact Form API is running!',
    endpoints: {
      contact: 'POST /contact',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
