EmailJS integration
===================

Steps to enable client-side email sending using EmailJS:

1. Sign up at https://www.emailjs.com/ and create an email service (e.g., Gmail, SMTP)
2. Create an email template with variables `from_name`, `from_email`, and `message` (or adapt `src/emailjsConfig.js`)
3. Copy the **Service ID**, **Template ID**, and **Public Key** from EmailJS
4. Open `src/emailjsConfig.js` and replace the placeholder values with your real IDs
5. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Notes:
- The client-side public key is visible to users; protect any sensitive data accordingly.
- If you prefer server-side sending (recommended for production), implement a `/contact` endpoint on your backend and keep API keys secret.
