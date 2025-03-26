import {
  Heading,
  Section,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout, Button, colors, baseUrl } from './shared-components';

interface OrderItem {
  productId: string;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  frameSize?: string;
  frameType?: string;
  engravingText?: string;
}

interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: Date | string;
  total: string | number;
  items: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export const OrderConfirmationEmail = ({
  order,
}: {
  order: OrderDetails;
}) => {
  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <EmailLayout preview={`Your Maps & Memories Order Confirmation - #${order.id}`}>
      <Heading style={styles.heading}>Order Confirmation</Heading>
      <Text style={styles.greeting}>Hello {order.customerName},</Text>
      <Text style={styles.paragraph}>
        Thank you for your order! We're excited to craft your personalized map frame.
        Your order has been confirmed and is being processed.
      </Text>
      
      <Section style={styles.orderInfoSection}>
        <Text style={styles.orderNumber}>Order #: {order.id}</Text>
        <Text style={styles.orderDate}>Date: {formatDate(order.orderDate)}</Text>
      </Section>

      <Heading as="h2" style={styles.subheading}>Order Summary</Heading>
      
      {/* Order Items */}
      <Section style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <Row key={index} style={styles.itemRow}>
            <Column style={styles.itemImageColumn}>
              <img
                src={item.image}
                alt={item.name}
                width="80"
                height="80"
                style={styles.itemImage}
              />
            </Column>
            <Column style={styles.itemDetailsColumn}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                Frame Size: {item.frameSize || 'Standard'}
              </Text>
              <Text style={styles.itemDetail}>
                Frame Type: {item.frameType || 'Standard'}
              </Text>
              {item.engravingText && (
                <Text style={styles.itemDetail}>
                  Engraving: "{item.engravingText}"
                </Text>
              )}
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={styles.hr} />
      
      {/* Order Total */}
      <Section style={styles.totalSection}>
        <Text style={styles.totalText}>
          Total: <span style={styles.totalAmount}>{formatCurrency(order.total)}</span>
        </Text>
      </Section>

      {/* Shipping Address */}
      <Heading as="h2" style={styles.subheading}>Shipping Information</Heading>
      <Section style={styles.addressSection}>
        <Text style={styles.addressText}>{order.customerName}</Text>
        <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
        </Text>
        <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
      </Section>

      <Text style={styles.paragraph}>
        We will notify you once your order ships. You can check the status of your order at any time by visiting{' '}
        <Link href={`${baseUrl}/orders/${order.id}`} style={styles.link}>
          your account
        </Link>.
      </Text>

      <Button href={`${baseUrl}/orders/${order.id}`}>
        View Order
      </Button>

      <Text style={styles.paragraph}>
        If you have any questions about your order, please don't hesitate to{' '}
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
  subheading: {
    color: colors.darkBlue,
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '30px',
    marginBottom: '15px',
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
    margin: '0 0 5px',
  },
  orderDate: {
    color: colors.darkBlue,
    fontSize: '16px',
    margin: '0',
  },
  itemsContainer: {
    margin: '20px 0',
  },
  itemRow: {
    margin: '15px 0',
    borderBottom: `1px solid ${colors.lightGray}`,
    paddingBottom: '15px',
  },
  itemImageColumn: {
    width: '90px',
    verticalAlign: 'top',
  },
  itemDetailsColumn: {
    verticalAlign: 'top',
    paddingLeft: '15px',
  },
  itemImage: {
    borderRadius: '4px',
    border: `1px solid ${colors.lightGray}`,
  },
  itemName: {
    color: colors.darkBlue,
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 5px',
  },
  itemDetail: {
    color: colors.softBlue,
    fontSize: '14px',
    margin: '0 0 3px',
  },
  itemQuantity: {
    color: colors.darkBlue,
    fontSize: '14px',
    margin: '5px 0 0',
  },
  itemPrice: {
    color: colors.warmBrown,
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '5px 0 0',
  },
  hr: {
    borderColor: colors.lightGray,
    margin: '20px 0',
  },
  totalSection: {
    textAlign: 'right' as const,
    margin: '20px 0',
  },
  totalText: {
    color: colors.darkBlue,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  totalAmount: {
    color: colors.warmBrown,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  addressSection: {
    margin: '15px 0 25px',
  },
  addressText: {
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