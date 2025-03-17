import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PasswordResetEmail } from '@/lib/email/templates/password-reset';
import { renderAsync } from '@react-email/components';

export async function POST(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get password reset data from request body
    const resetData = await request.json();
    
    // Validate required fields
    if (!resetData.adminName || !resetData.resetLink) {
      return new NextResponse(JSON.stringify({ error: 'Missing required reset data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Render the email HTML
    const html = await renderAsync(PasswordResetEmail(resetData));

    // Return the HTML
    return new NextResponse(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating password reset email preview:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate email preview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 