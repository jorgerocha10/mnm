'use client';

import {
  Heading,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout, Button, colors, baseUrl } from './shared-components';

interface PasswordResetProps {
  adminName: string;
  resetLink: string;
  expiryTime?: string;
}

export const PasswordResetEmail = ({
  adminName,
  resetLink,
  expiryTime = '24 hours',
}: PasswordResetProps) => {
  return (
    <EmailLayout preview="Reset Your Maps & Memories Admin Password">
      <Heading style={styles.heading}>Password Reset Request</Heading>
      
      <Text style={styles.greeting}>Hello {adminName},</Text>
      
      <Text style={styles.paragraph}>
        We received a request to reset your password for the Maps & Memories admin panel.
        If you didn't make this request, you can safely ignore this email.
      </Text>
      
      <Text style={styles.paragraph}>
        To reset your password, click the button below. This link will expire in {expiryTime}.
      </Text>
      
      <Button href={resetLink}>
        Reset Password
      </Button>
      
      <Text style={styles.securityNote}>
        For security reasons, this password reset link can only be used once and will expire after {expiryTime}.
        If you need assistance, please contact the system administrator.
      </Text>
      
      <Section style={styles.warningSection}>
        <Text style={styles.warningText}>
          If you didn't request a password reset, please secure your account by changing your password immediately
          and notify the system administrator.
        </Text>
      </Section>
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
  securityNote: {
    color: colors.softBlue,
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '30px 0 20px',
    textAlign: 'center' as const,
  },
  warningSection: {
    backgroundColor: '#FEF3F2',
    borderLeft: `4px solid #F87171`,
    padding: '15px',
    borderRadius: '4px',
    marginTop: '30px',
  },
  warningText: {
    color: '#B91C1C',
    fontSize: '14px',
    margin: '0',
  },
}; 