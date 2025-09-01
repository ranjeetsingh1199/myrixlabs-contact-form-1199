# MyrixLabs Contact Form - Serverless Function

A simple serverless contact form function for DigitalOcean Functions with SMTP email sending.

## Features

- 📧 **SMTP Email Integration**: Send contact form submissions via email using Nodemailer
- 🚀 **Serverless**: Runs on DigitalOcean Functions
- 🔒 **Basic Validation**: Input validation for required fields
- 📱 **CORS Enabled**: Ready for frontend integration
- ⚡ **Lightweight**: Minimal dependencies and code

## Required Fields

- `firstName` (string, required)
- `lastName` (string, required) 
- `email` (string, required, valid email format)
- `message` (string, required)

## Setup

### 1. Environment Variables

Set these environment variables in your DigitalOcean Function:

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-brevo-email@domain.com
EMAIL_PASS=your-brevo-smtp-key
EMAIL_FROM=your-brevo-email@domain.com
EMAIL_TO=contact@myrixlabs.com
NODE_ENV=production
```

### 2. Email Provider Setup

#### Brevo (Sendinblue) Setup
1. Create a Brevo account at [brevo.com](https://www.brevo.com)
2. Go to your Brevo dashboard
3. Navigate to **SMTP & API** → **SMTP**
4. Generate an SMTP key:
   - Click "Generate a new SMTP key"
   - Give it a name (e.g., "Contact Form")
   - Copy the generated SMTP key
5. Use these settings in your environment variables:
   - **EMAIL_HOST**: `smtp-relay.brevo.com`
   - **EMAIL_PORT**: `587`
   - **EMAIL_USER**: Your Brevo account email
   - **EMAIL_PASS**: Your generated SMTP key

#### Other SMTP Providers
| Provider | Host | Port | Security |
|----------|------|------|----------|
| **Brevo** | smtp-relay.brevo.com | 587 | STARTTLS |
| Gmail | smtp.gmail.com | 587 | STARTTLS |
| Outlook | smtp-mail.outlook.com | 587 | STARTTLS |
| Yahoo | smtp.mail.yahoo.com | 587 | STARTTLS |
| Custom SMTP | your-smtp-server.com | 587/465 | STARTTLS/SSL |

## Deployment to DigitalOcean

### Method 1: Using DigitalOcean CLI

1. Install DigitalOcean CLI:
   ```bash
   npm install -g @digitalocean/doctl
   ```

2. Authenticate:
   ```bash
   doctl auth init
   ```

3. Deploy the function:
   ```bash
   doctl serverless deploy serverless/ --remote-build
   ```

### Method 2: Using DigitalOcean Console

1. Go to DigitalOcean Functions in your console
2. Create a new function
3. Upload the `contact-form.js` file
4. Set the environment variables
5. Deploy

## API Usage

### Request

```bash
POST https://your-function-url.digitaloceanspaces.com/contact-form
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to know more about your services."
}
```

### Response

**Success:**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "messageId": "email-message-id"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Missing required fields: firstName, lastName, email, message"
}
```

## Frontend Integration

### JavaScript Example

```javascript
async function submitContactForm(formData) {
  try {
    const response = await fetch('https://your-function-url.digitaloceanspaces.com/contact-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Message sent successfully!');
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  message: 'Hello, I would like to know more about your services.'
};

submitContactForm(formData);
```

### HTML Form Example

```html
<form id="contactForm">
  <input type="text" name="firstName" placeholder="First Name" required>
  <input type="text" name="lastName" placeholder="Last Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send Message</button>
</form>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch('https://your-function-url.digitaloceanspaces.com/contact-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Message sent successfully!');
      e.target.reset();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
});
</script>
```

## File Structure

```
serverless/
├── contact-form.js      # Main serverless function
├── package.json         # Dependencies
├── env.example          # Environment variables template
└── README.md           # This file
```

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check your SMTP credentials
   - Verify environment variables are set correctly
   - Check firewall/network restrictions

2. **CORS errors**
   - The function includes CORS headers
   - Make sure you're making requests from an allowed origin

3. **Function timeout**
   - DigitalOcean Functions have execution time limits
   - Check your SMTP server response time

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in the response.

## Cost

DigitalOcean Functions pricing:
- Free tier: 100,000 requests/month
- Pay-as-you-go: $0.0000184 per GB-second

## Support

For support, email contact@myrixlabs.com or create an issue in the repository.

---

**Made with ❤️ by MyrixLabs**