# MyrixLabs Contact Form API

Contact form API built with Node.js and Express for DigitalOcean App Platform.

## Features

- Contact form endpoint with validation
- SMTP email sending via Brevo
- Fresh SMTP connection for each email
- CORS enabled
- Error handling

## Environment Variables

Set these in DigitalOcean App Platform:

```
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_brevo_username
EMAIL_PASS=your_brevo_api_key
EMAIL_TO=your_email@example.com
```

## API Endpoints

### `POST /contact`

Send contact form submission.

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent!",
  "messageId": "message-id"
}
```

### `GET /`

API health check.

## Deployment

Deploy to DigitalOcean App Platform with environment variables configured.
