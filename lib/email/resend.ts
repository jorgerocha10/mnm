import { Resend } from 'resend';

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email addresses
export const emailConfig = {
  from: 'onboarding@resend.dev',
  replyTo: 'support@maps-and-memories.com',
}; 