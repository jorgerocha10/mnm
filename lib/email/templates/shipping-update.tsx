import {
  Heading,
  Section,
  Text,
  Link,
} from '@react-email/components';
import { EmailLayout, Button, colors, baseUrl } from './shared-components';

interface ShippingUpdateProps {
  orderId: string;
  customerName: string;
  status: 'shipped' | 'out_for_delivery' | 'delivered';
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  carrier?: string;
}

export const ShippingUpdateEmail = ({
  orderId,
  customerName,
  status,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  carrier,
}: ShippingUpdateProps) => {
  // Get status-specific content
  const getStatusContent = () => {
    switch (status) {
      case 'shipped':
        return {
          title: 'Your Order Has Shipped!',
          message: `We're excited to let you know that your Maps & Memories order #${orderId} has been shipped and is on its way to you.`,
          emoji: '🚚',
        };
      case 'out_for_delivery':
        return {
          title: 'Your Order Is Out For Delivery!',
          message: `Great news! Your Maps & Memories order #${orderId} is out for delivery and should arrive today.`,
          emoji: '📦',
        };
      case 'delivered':
        return {
          title: 'Your Order Has Been Delivered!',
          message: `Your Maps & Memories order #${orderId} has been delivered. We hope you love your personalized map frame!`,
          emoji: '🎉',
        };
      default:
        return {
          title: 'Shipping Update',
          message: `Here's an update on your Maps & Memories order #${orderId}.`,
          emoji: '📫',
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <EmailLayout preview={`${statusContent.title} - Order #${orderId}`}>
      <Heading style={styles.heading}>
        {statusContent.emoji} {statusContent.title}
      </Heading>
      
      <Text style={styles.greeting}>Hello {customerName},</Text>
      
      <Text style={styles.paragraph}>
        {statusContent.message}
      </Text>
      
      <Section style={styles.orderInfoSection}>
        <Text style={styles.orderNumber}>Order #: {orderId}</Text>
        {carrier && (
          <Text style={styles.shippingDetail}>Carrier: {carrier}</Text>
        )}
        {trackingNumber && (
          <Text style={styles.shippingDetail}>
            Tracking Number: {trackingNumber}
          </Text>
        )}
        {estimatedDelivery && status !== 'delivered' && (
          <Text style={styles.shippingDetail}>
            Estimated Delivery: {estimatedDelivery}
          </Text>
        )}
      </Section>
      
      {trackingUrl && status !== 'delivered' && (
        <Button href={trackingUrl}>
          Track Your Package
        </Button>
      )}
      
      <Button href={`${baseUrl}/orders/${orderId}`}>
        View Order Details
      </Button>
      
      <Text style={styles.paragraph}>
        If you have any questions about your delivery, please don't hesitate to{' '}
        <Link href="mailto:support@maps-and-memories.com" style={styles.link}>
          contact our support team
        </Link>.
      </Text>
      
      <Text style={styles.thankyou}>
        Thank you for shopping with Maps & Memories!
      </Text>
    </EmailLayout>
  );
};

const styles = {
  heading: {
    color: colors.darkBlue,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '20px 0',
  },
  greeting: {
    color: colors.darkBlue,
    fontSize: '16px',
    margin: '0 0 20px',
    fontWeight: 'bold',
  },
  paragraph: {
    color: colors.darkBlue,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  orderInfoSection: {
    backgroundColor: colors.beige + '20',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  orderNumber: {
    color: colors.darkBlue,
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px',
  },
  shippingDetail: {
    color: colors.darkBlue,
    fontSize: '16px',
    margin: '0 0 5px',
  },
  link: {
    color: colors.warmBrown,
    textDecoration: 'underline',
  },
  thankyou: {
    color: colors.darkBlue,
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0 10px',
  },
}; 