import { resend, emailConfig } from './resend';
import { renderAsync } from '@react-email/components';
import { OrderConfirmationEmail } from './templates/order-confirmation';
import { ShippingUpdateEmail } from './templates/shipping-update';
import { PasswordResetEmail } from './templates/password-reset';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  cc,
  bcc,
}: SendEmailOptions) {
  try {
    const { from, replyTo } = emailConfig;
    
    console.log('Attempting to send email:', {
      to,
      subject,
      from,
      replyTo,
    });
    
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      cc,
      bcc,
      replyTo,
    });

    console.log('Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error sending email:', {
      error,
      errorMessage: error?.message,
      errorResponse: error?.response,
      to,
      subject,
    });
    return { success: false, error };
  }
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(
  order: Parameters<typeof OrderConfirmationEmail>[0]['order']
) {
  const html = await renderAsync(OrderConfirmationEmail({ order }));
  
  return sendEmail({
    to: order.customerEmail,
    subject: `Your Maps & Memories Order Confirmation - #${order.id}`,
    html,
  });
}

// Shipping Update Email
export async function sendShippingUpdateEmail(
  params: Parameters<typeof ShippingUpdateEmail>[0]
) {
  const { customerName, orderId, status } = params;
  
  // Determine subject based on status
  let subject = 'Shipping Update for Your Maps & Memories Order';
  if (status === 'shipped') {
    subject = 'Your Maps & Memories Order Has Shipped!';
  } else if (status === 'out_for_delivery') {
    subject = 'Your Maps & Memories Order Is Out For Delivery!';
  } else if (status === 'delivered') {
    subject = 'Your Maps & Memories Order Has Been Delivered!';
  }
  
  const html = await renderAsync(ShippingUpdateEmail(params));
  
  // In a real app, you'd get the customer email from the database
  // For this example, we're using a placeholder
  const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  
  return sendEmail({
    to: customerEmail,
    subject: `${subject} - #${orderId}`,
    html,
  });
}

// Password Reset Email
export async function sendPasswordResetEmail(
  params: Parameters<typeof PasswordResetEmail>[0]
) {
  const { adminName } = params;
  
  const html = await renderAsync(PasswordResetEmail(params));
  
  // Get admin email from database in a real scenario
  // For this example, we're using a placeholder
  const adminEmail = `${adminName.toLowerCase().replace(/\s+/g, '.')}@maps-and-memories.com`;
  
  return sendEmail({
    to: adminEmail,
    subject: 'Reset Your Maps & Memories Admin Password',
    html,
  });
} 