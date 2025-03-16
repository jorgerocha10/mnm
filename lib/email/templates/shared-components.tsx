import React, { FC, ReactNode } from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Img,
} from '@react-email/components';

// Base URL for the website
export const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maps-and-memories.com';

// Brand colors
export const colors = {
  white: '#F7F5F6',
  darkBlue: '#253946',
  softBlue: '#95A7B5',
  beige: '#D2BDA2',
  warmBrown: '#A76825',
  lightGray: '#E5E7EB',
};

// Shared email layout component
interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export const EmailLayout: FC<EmailLayoutProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src={`${baseUrl}/images/Logo_4.png`}
              width="180"
              height="50"
              alt="Maps & Memories"
              style={styles.logo}
            />
          </Section>
          {children}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Maps & Memories. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              123 Map Street, Cartography City, MC 12345
            </Text>
            <Text style={styles.footerLinks}>
              <Link href={`${baseUrl}`} style={styles.link}>
                Website
              </Link>{' '}
              •{' '}
              <Link href={`${baseUrl}/privacy`} style={styles.link}>
                Privacy Policy
              </Link>{' '}
              •{' '}
              <Link href={`${baseUrl}/terms`} style={styles.link}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Button component for emails
interface ButtonProps {
  href: string;
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const Button: FC<ButtonProps> = ({ href, children, align = 'center' }) => {
  return (
    <Section style={{ textAlign: align as any }}>
      <Link href={href} style={styles.button}>
        {children}
      </Link>
    </Section>
  );
};

// Styled components common styles
const styles = {
  body: {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.4',
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: colors.white,
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  logo: {
    margin: '0 auto',
  },
  heading: {
    color: colors.darkBlue,
    fontSize: '24px',
    marginBottom: '20px',
  },
  paragraph: {
    color: colors.darkBlue,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  button: {
    backgroundColor: colors.warmBrown,
    borderRadius: '4px',
    color: colors.white,
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '20px 0',
  },
  hr: {
    borderColor: colors.lightGray,
    margin: '30px 0',
  },
  footer: {
    textAlign: 'center' as const,
  },
  footerText: {
    color: colors.softBlue,
    fontSize: '14px',
    margin: '8px 0',
  },
  footerLinks: {
    color: colors.softBlue,
    fontSize: '14px',
    margin: '16px 0',
  },
  link: {
    color: colors.warmBrown,
    textDecoration: 'none',
  },
}; 