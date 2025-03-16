import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email/send-email';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if admin exists in the database
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    
    if (!admin) {
      // For security reasons, we don't disclose whether the email exists
      // Instead, we return a success response but don't send an email
      return NextResponse.json({ message: 'If the email exists, a password reset link has been sent' });
    }
    
    // Generate reset token and save to database
    const resetToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
    
    // Update admin record with reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiresAt: expiresAt,
      },
    });
    
    // Generate reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${resetToken}`;
    
    // Send the email
    const result = await sendPasswordResetEmail({
      adminName: admin.name,
      resetLink,
      expiryTime: '24 hours',
    });
    
    if (!result.success) {
      throw new Error('Failed to send password reset email');
    }
    
    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return NextResponse.json(
      { message: 'Error sending password reset email' },
      { status: 500 }
    );
  }
} 