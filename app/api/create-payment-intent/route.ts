import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';

// Check if the Stripe secret key exists and log it for debugging purposes (sanitized)
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
} else {
  const keyStart = process.env.STRIPE_SECRET_KEY.substring(0, 7);
  const keyEnd = process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4);
  console.log(`Stripe key configured: ${keyStart}...${keyEnd}`);
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Schema for validating the request body
const paymentSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  console.log('Payment intent creation request received');
  
  // Verify that Stripe is initialized with a valid key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe is not properly configured - missing API key');
    return NextResponse.json(
      { error: 'Stripe is not properly configured' },
      { status: 500 }
    );
  }
  
  try {
    // Parse and validate request body
    const body = await req.json();
    console.log('Request body received:', JSON.stringify({ amount: body.amount }));
    
    // Validate the data
    const validatedData = paymentSchema.parse(body);
    
    // Convert amount to cents (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(validatedData.amount * 100);
    console.log(`Creating payment intent for amount: ${amountInCents} cents`);
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      // Include any additional metadata as needed
      metadata: {
        source: 'maps_and_memories_website',
      },
    });
    
    console.log(`Payment intent created successfully: ${paymentIntent.id}`);
    
    // Return the client secret to the client
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle different error types
    if (error instanceof z.ZodError) {
      console.error('Validation error:', JSON.stringify(error.errors));
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', (error as any).message, 'Type:', error.type);
      return NextResponse.json(
        { error: 'Payment processing error', message: (error as any).message, type: error.type },
        { status: 400 }
      );
    }
    
    // Generic error handler
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 