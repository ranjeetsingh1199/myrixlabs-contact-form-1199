const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { firstName, lastName, email, message } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required fields: firstName, lastName, email, message'
        })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email address'
        })
      };
    }

    // Create transporter for Brevo SMTP
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Brevo specific configuration
      tls: {
        rejectUnauthorized: false
      }
    });

    // Prepare email content
    const fullName = `${firstName} ${lastName}`;
    const emailContent = `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Message: ${message}

Timestamp: ${new Date().toLocaleString()}
    `.trim();

    // Send email via Brevo
    const info = await transporter.sendMail({
      from: `"${fullName}" <${email}>`,  // Use user's email as sender
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Contact Form: New Message from ${fullName}`,
      text: emailContent,
      // Brevo specific headers
      headers: {
        'X-Mailer': 'MyrixLabs Contact Form',
        'X-Priority': '3'
      }
    });

    console.log('Email sent successfully via Brevo:', info.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        messageId: info.messageId
      })
    };

  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};