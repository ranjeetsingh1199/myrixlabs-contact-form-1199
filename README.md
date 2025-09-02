# MyrixLabs Contact Form API

A robust contact form API built with Node.js and Express, designed for DigitalOcean App Platform deployment.

## Features

- ✅ Contact form endpoint with validation
- ✅ SMTP email sending via Brevo (formerly Sendinblue)
- ✅ Connection pooling and automatic reconnection
- ✅ Health check endpoints
- ✅ CORS enabled
- ✅ Error handling and logging

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Fill in your SMTP credentials in the `.env` file:
   ```env
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_USER=your_brevo_username
   EMAIL_PASS=your_brevo_api_key
   EMAIL_TO=your_email@example.com
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Send contact form
   curl -X POST http://localhost:3000/contact \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "message": "Hello World!"
     }'
   ```

## DigitalOcean App Platform Deployment

### 1. Deploy via App Platform

1. **Connect your GitHub repository**
2. **Select the `functions/contactForm.js` file** as your function
3. **Set environment variables** in the App Platform dashboard:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO`

### 2. Update your `project.yml`:

```yaml
packages:
  - name: myrixlabs-contact-form
    functions:
      - name: contactForm
        runtime: nodejs:default
        web: true
        parameters:
          EMAIL_HOST: '{{EMAIL_HOST}}'
          EMAIL_PORT: '{{EMAIL_PORT}}'
          EMAIL_USER: '{{EMAIL_USER}}'
          EMAIL_PASS: '{{EMAIL_PASS}}'
          EMAIL_TO: '{{EMAIL_TO}}'
```

## Troubleshooting Email Issues

### Problem: Emails only work on first hit after deployment

**Symptoms:**
- First API call sends email successfully
- Subsequent calls fail silently or with connection errors
- No emails received after initial success

**Root Causes:**
1. **SMTP Connection Pooling Issues** - DigitalOcean may reuse expired connections
2. **Environment Variable Caching** - Variables not properly refreshed
3. **Connection Timeouts** - SMTP server closes connections

**Solutions Implemented:**

1. **Connection Pooling:**
   ```javascript
   pool: true,
   maxConnections: 5,
   maxMessages: 100,
   ```

2. **Automatic Reconnection:**
   - Transporter verification before each send
   - Automatic recreation of failed connections
   - Connection error detection and recovery

3. **Timeout Management:**
   ```javascript
   connectionTimeout: 60000,
   greetingTimeout: 30000,
   socketTimeout: 60000,
   ```

### Debugging Steps

1. **Check the health endpoint:**
   ```bash
   curl https://your-app.ondigitalocean.app/health
   ```

2. **Monitor logs in DigitalOcean dashboard:**
   - Look for "Creating new SMTP transporter"
   - Check for connection verification failures
   - Monitor email sending success/failure

3. **Verify environment variables:**
   - Ensure all SMTP credentials are set
   - Check for typos in variable names
   - Verify Brevo API key is valid

4. **Test SMTP connection:**
   ```bash
   # Test with telnet (if available)
   telnet smtp-relay.brevo.com 587
   ```

### Common SMTP Issues

1. **Authentication Failed:**
   - Verify Brevo API key
   - Check username format
   - Ensure account is active

2. **Connection Refused:**
   - Verify port (587 for TLS, 465 for SSL)
   - Check firewall settings
   - Ensure Brevo service is accessible

3. **Rate Limiting:**
   - Brevo has sending limits
   - Check your account quota
   - Implement delays if needed

## API Endpoints

### `POST /contact`
Send a contact form submission.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent!",
  "messageId": "message-id-here"
}
```

### `GET /health`
Check API and email connection status.

**Response:**
```json
{
  "status": "healthy",
  "email": {
    "connected": true,
    "host": "smtp-relay.brevo.com",
    "port": "587",
    "user": "configured",
    "to": "configured"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /`
Basic API information.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server hostname | `smtp-relay.brevo.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | `your_username` |
| `EMAIL_PASS` | SMTP password/API key | `your_api_key` |
| `EMAIL_TO` | Recipient email address | `contact@myrixlabs.com` |

## Dependencies

- **express**: Web framework
- **nodemailer**: Email sending library
- **cors**: Cross-origin resource sharing

## Support

If you continue experiencing issues:

1. Check DigitalOcean App Platform logs
2. Verify Brevo SMTP settings
3. Test with the health endpoint
4. Review connection pooling settings

## License

MIT License
