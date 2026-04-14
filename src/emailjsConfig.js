// Replace the placeholder values below with the values from your EmailJS account.
// Create an account at https://www.emailjs.com/, add an email service and a template,
// then copy Service ID, Template ID and Public Key here.

export const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
export const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
export const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';

// Example template parameters expected by the template:
// { from_name, from_email, message }

export default {
  serviceId: EMAILJS_SERVICE_ID,
  templateId: EMAILJS_TEMPLATE_ID,
  publicKey: EMAILJS_PUBLIC_KEY,
};
