const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Track email attempts
let emailAttempts = 0;
let successfulEmails = 0;
let failedEmails = 0;

// Middleware
app.use(cors());
app.use(express.json());

// Debug environment variables
app.get('/debug-env', (req, res) => {
  const envVars = {
    EMAIL_HOST: process.env.EMAIL_HOST || 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER || 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET',
    EMAIL_TO: process.env.EMAIL_TO || 'NOT SET'
  };
  res.json(envVars);
});

// Email statistics endpoint
app.get('/email-stats', (req, res) => {
  res.json({
    totalAttempts: emailAttempts,
    successful: successfulEmails,
    failed: failedEmails,
    successRate: emailAttempts > 0 ? ((successfulEmails / emailAttempts) * 100).toFixed(2) + '%' : '0%'
  });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  emailAttempts++;
  const attemptNumber = emailAttempts;
  
  try {
    console.log(`\n=== EMAIL ATTEMPT #${attemptNumber} ===`);
    console.log('Timestamp:', new Date().toISOString());
    
    // Debug: Log environment variables
    console.log('Environment Variables Check:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    console.log('EMAIL_TO:', process.env.EMAIL_TO);

    const { firstName, lastName, email, message } = req.body;
    console.log('Request Data:', { firstName, lastName, email, messageLength: message?.length });

    if (!firstName || !lastName || !email || !message) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
      failedEmails++;
      return res.status(500).json({
        success: false,
        message: "Email configuration missing. Please check environment variables.",
        missing: {
          EMAIL_HOST: !process.env.EMAIL_HOST,
          EMAIL_PORT: !process.env.EMAIL_PORT,
          EMAIL_USER: !process.env.EMAIL_USER,
          EMAIL_PASS: !process.env.EMAIL_PASS,
          EMAIL_TO: !process.env.EMAIL_TO
        }
      });
    }

    console.log('✅ Environment variables OK, creating fresh transporter for this request...');

    // Create a fresh SMTP transporter INSIDE the handler for each request
    // This ensures every request gets a completely fresh connection
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
      maxMessages: 1
    });

    console.log('✅ Transporter created, preparing email...');

    const fullName = `${firstName} ${lastName}`;
    const emailContent = `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Message: ${message}

Timestamp: ${new Date().toLocaleString()}
Attempt Number: ${attemptNumber}
    `.trim();

    console.log('✅ Email content prepared, sending...');

    const info = await transporter.sendMail({
      from: `"${fullName}" <${email}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Contact Form: New Message from ${fullName} (Attempt #${attemptNumber})`,
      text: emailContent,
      headers: { "X-Mailer": "MyrixLabs Contact Form" },
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    // Transporter is automatically cleaned up since it's created fresh for each request
    console.log('✅ Email completed, transporter will be cleaned up automatically');
    
    successfulEmails++;

    res.json({
      success: true,
      message: "Message sent!",
      messageId: info.messageId,
      attemptNumber: attemptNumber
    });
  } catch (error) {
    console.error(`❌ ERROR in attempt #${attemptNumber}:`, error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    // Transporter is automatically cleaned up since it's created fresh for each request
    console.log('✅ Error occurred, transporter will be cleaned up automatically');
    
    failedEmails++;

    res.status(500).json({
      success: false,
      message: "Failed to send email.",
      error: error.message,
      attemptNumber: attemptNumber,
      errorCode: error.code
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MyrixLabs Contact Form API is running!',
    endpoints: {
      contact: 'POST /contact',
      debug: 'GET /debug-env',
      stats: 'GET /email-stats'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Enhanced logging enabled for debugging');
});
