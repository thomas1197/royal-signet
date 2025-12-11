/**
 * Royal Signet Church - Firebase Cloud Functions
 *
 * This file contains serverless functions for:
 * - Stripe payment processing
 * - Email notifications
 * - Donation management
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as sgMail from '@sendgrid/mail';
import * as cors from 'cors';
import * as express from 'express';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe (API key stored in Firebase config)
const stripeSecretKey = functions.config().stripe?.secret_key;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
}) : null;

// Initialize SendGrid (API key stored in Firebase config)
const sendGridKey = functions.config().sendgrid?.key;
if (sendGridKey) {
  sgMail.setApiKey(sendGridKey);
}

// CORS configuration
const corsHandler = cors({ origin: true });

// ============================================================================
// STRIPE PAYMENT FUNCTIONS
// ============================================================================

/**
 * Create Payment Intent
 *
 * This function creates a Stripe payment intent for donations
 * Called from the mobile app when user wants to donate
 *
 * Request body:
 * - amount: number (in cents, e.g., 5000 = $50.00)
 * - currency: string (default: 'usd')
 * - donationType: string ('tithe' | 'offering' | 'special')
 * - note: string (optional)
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to make donations'
    );
  }

  // Validate Stripe is configured
  if (!stripe) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Stripe is not configured on the server'
    );
  }

  const { amount, currency = 'usd', donationType, note } = data;
  const userId = context.auth.uid;

  // Validate amount
  if (!amount || amount < 100) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Donation amount must be at least $1.00'
    );
  }

  if (amount > 1000000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Donation amount cannot exceed $10,000'
    );
  }

  try {
    // Get user details from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        userEmail: userData?.email || 'unknown',
        userName: userData?.displayName || 'Anonymous',
        donationType: donationType || 'offering',
        note: note || '',
        timestamp: new Date().toISOString(),
      },
      description: `${donationType || 'Offering'} - Royal Signet Church`,
    });

    // Log the payment intent creation
    console.log(`Payment intent created: ${paymentIntent.id} for user ${userId}, amount: $${amount / 100}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create payment intent: ${error.message}`
    );
  }
});

/**
 * Handle Stripe Webhook
 *
 * This function handles webhooks from Stripe for payment status updates
 * Automatically called by Stripe when payment status changes
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (!stripe) {
      res.status(500).send('Stripe not configured');
      return;
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = functions.config().stripe?.webhook_secret;

    if (!sig || !webhookSecret) {
      res.status(400).send('Missing signature or webhook secret');
      return;
    }

    try {
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;

  // Save donation to Firestore
  const donationData = {
    paymentIntentId: paymentIntent.id,
    userId: metadata.userId,
    userEmail: metadata.userEmail,
    userName: metadata.userName,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    donationType: metadata.donationType,
    note: metadata.note,
    status: 'completed',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    paymentMethod: paymentIntent.payment_method,
  };

  await admin.firestore().collection('donations').add(donationData);

  console.log(`Payment succeeded: ${paymentIntent.id}, amount: $${paymentIntent.amount / 100}`);

  // Send thank you email
  if (sendGridKey && metadata.userEmail) {
    await sendDonationThankYouEmail(
      metadata.userEmail,
      metadata.userName,
      paymentIntent.amount / 100,
      metadata.donationType
    );
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;

  console.error(`Payment failed: ${paymentIntent.id}, user: ${metadata.userId}`);

  // Optionally save failed attempt to Firestore for analytics
  await admin.firestore().collection('failed_payments').add({
    paymentIntentId: paymentIntent.id,
    userId: metadata.userId,
    amount: paymentIntent.amount,
    failureReason: paymentIntent.last_payment_error?.message || 'Unknown',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================================================
// EMAIL NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send Welcome Email
 *
 * Triggered when a new user creates an account
 */
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || 'Friend';

  if (!email || !sendGridKey) {
    console.log('Email or SendGrid not configured, skipping welcome email');
    return;
  }

  const msg = {
    to: email,
    from: {
      email: 'noreply@royalsignet.church',
      name: 'Royal Signet Church'
    },
    subject: 'Welcome to Royal Signet Church! 🙏',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: white;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  background: #8B0101;
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0 0 10px 0;
                  font-size: 28px;
                  font-weight: 600;
              }
              .header p {
                  margin: 0;
                  font-size: 16px;
                  opacity: 0.9;
              }
              .content {
                  background: #FFF9E9;
                  padding: 40px 30px;
              }
              .content h2 {
                  color: #8B0101;
                  margin: 0 0 20px 0;
                  font-size: 24px;
              }
              .content p {
                  margin: 0 0 15px 0;
                  font-size: 16px;
              }
              .content ul, .content ol {
                  margin: 15px 0;
                  padding-left: 25px;
              }
              .content li {
                  margin: 8px 0;
                  font-size: 15px;
              }
              .button {
                  display: inline-block;
                  background: #8B0101;
                  color: white !important;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: 600;
                  font-size: 16px;
              }
              .button:hover {
                  background: #A20404;
              }
              .footer {
                  text-align: center;
                  padding: 30px;
                  color: #666;
                  font-size: 13px;
                  background: white;
              }
              .footer p {
                  margin: 5px 0;
              }
              .highlight {
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  margin: 20px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Royal Signet Church!</h1>
                  <p>A New Beginning in His Presence Begins Here</p>
              </div>
              <div class="content">
                  <h2>Hello ${displayName}! 👋</h2>

                  <p>Thank you for joining our Royal Signet Church family! We're excited to have you with us on this journey of faith.</p>

                  <div class="highlight">
                      <p><strong>Your account is now set up with:</strong></p>
                      <ul>
                          <li>✅ Full access to sermons and teachings</li>
                          <li>✅ Event notifications and RSVP</li>
                          <li>✅ Prayer wall community</li>
                          <li>✅ Life group materials and schedules</li>
                          <li>✅ Secure online giving</li>
                      </ul>
                  </div>

                  <p><strong>Get started with these next steps:</strong></p>
                  <ol>
                      <li>Complete your profile in the app</li>
                      <li>Browse our latest sermons and messages</li>
                      <li>Join a Life Group to connect with others</li>
                      <li>Share prayer requests with the community</li>
                      <li>RSVP for upcoming events</li>
                  </ol>

                  <p><strong>Need help?</strong> Our team is here for you:</p>
                  <p>📧 Email: <a href="mailto:info@royalsignet.church" style="color: #8B0101;">info@royalsignet.church</a></p>

                  <p style="margin-top: 30px;">We look forward to seeing you at church!</p>

                  <p><strong>Blessings,</strong><br>
                  The Royal Signet Church Team</p>
              </div>
              <div class="footer">
                  <p><strong>Royal Signet Church</strong></p>
                  <p>Come as You Are</p>
                  <p style="margin-top: 15px; color: #999; font-size: 12px;">
                      You received this email because you created an account with Royal Signet Church.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
  }
});

/**
 * Send donation thank you email
 */
async function sendDonationThankYouEmail(
  email: string,
  name: string,
  amount: number,
  donationType: string
) {
  const msg = {
    to: email,
    from: {
      email: 'noreply@royalsignet.church',
      name: 'Royal Signet Church'
    },
    subject: 'Thank You for Your Generous Gift 🙏',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: white;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  background: #8B0101;
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
              }
              .content {
                  background: #FFF9E9;
                  padding: 40px 30px;
              }
              .amount-box {
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  text-align: center;
                  margin: 20px 0;
              }
              .amount {
                  font-size: 36px;
                  color: #8B0101;
                  font-weight: bold;
              }
              .footer {
                  text-align: center;
                  padding: 30px;
                  color: #666;
                  font-size: 13px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Thank You! 🙏</h1>
              </div>
              <div class="content">
                  <h2>Dear ${name},</h2>

                  <p>Thank you for your generous ${donationType} to Royal Signet Church!</p>

                  <div class="amount-box">
                      <p style="margin: 0; color: #666; font-size: 14px;">Your Donation</p>
                      <div class="amount">$${amount.toFixed(2)}</div>
                      <p style="margin: 0; color: #666; font-size: 14px;">${new Date().toLocaleDateString()}</p>
                  </div>

                  <p>Your gift helps us continue our mission to serve our community and share God's love.</p>

                  <p><strong>Tax Receipt:</strong> This email serves as your donation receipt for tax purposes. Please keep it for your records.</p>

                  <p style="margin-top: 30px;">May God bless you abundantly!</p>

                  <p><strong>In Gratitude,</strong><br>
                  Royal Signet Church</p>
              </div>
              <div class="footer">
                  <p><strong>Royal Signet Church</strong></p>
                  <p>Tax ID: [Your EIN Here]</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Thank you email sent to ${email} for donation of $${amount}`);
  } catch (error: any) {
    console.error('Error sending thank you email:', error);
  }
}
