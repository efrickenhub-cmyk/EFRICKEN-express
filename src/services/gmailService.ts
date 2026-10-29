/**
 * Gmail Integration Service for Efricken Express
 * Direct REST API client for Gmail using Google OAuth2 Bearer tokens.
 * Handles template creation, RFC 2822 email encoding, and dispatching.
 */
import { Shipment, CompanySettings, ProofOfDelivery, PaymentRecord } from '../types';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromName?: string;
}

export interface SentEmailLogItem {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  trackingNumber?: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Session-based history of emails sent
const sentEmailHistory: SentEmailLogItem[] = [];

/**
 * Base64URL encoding compliant with Gmail API requirements
 */
function toBase64Url(str: string): string {
  // Convert utf-8 string to binary string safely
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Build RFC 2822 standard email message string
 */
function createRawEmailMessage(
  fromEmail: string,
  fromName: string,
  toEmail: string,
  subject: string,
  htmlContent: string
): string {
  const boundary = `boundary_${Date.now()}`;
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const lines = [
    `From: "${fromName.replace(/"/g, '')}" <${fromEmail}>`,
    `To: <${toEmail}>`,
    `Subject: ${utf8Subject}`,
    `MIME-Version: 1.0`,
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    // Plaintext fallback
    htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    htmlContent,
    '',
    `--${boundary}--`,
  ];

  return lines.join('\r\n');
}

/**
 * Fetch authenticated user's Gmail profile
 */
export async function fetchGmailProfile(accessToken: string): Promise<GmailProfile> {
  const response = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Gmail profile (${response.status})`
    );
  }

  return response.json();
}

/**
 * Send an email via the Gmail API
 */
export async function sendGmailMessage(
  payload: SendEmailPayload,
  accessToken: string,
  senderEmail: string,
  trackingNumber?: string
): Promise<{ id: string; threadId: string }> {
  try {
    const fromName = payload.fromName || 'Efricken Express Logistics';
    const rawMessage = createRawEmailMessage(
      senderEmail,
      fromName,
      payload.to,
      payload.subject,
      payload.htmlBody
    );

    const base64UrlMessage = toBase64Url(rawMessage);

    const response = await fetch(`${GMAIL_API_BASE}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: base64UrlMessage,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.error?.message || `Gmail API error (${response.status})`;
      
      sentEmailHistory.unshift({
        id: `err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        to: payload.to,
        subject: payload.subject,
        trackingNumber,
        status: 'failed',
        errorMessage: errorMsg,
      });

      throw new Error(errorMsg);
    }

    const data = await response.json();

    sentEmailHistory.unshift({
      id: data.id || `sent-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to: payload.to,
      subject: payload.subject,
      trackingNumber,
      status: 'sent',
    });

    return data;
  } catch (err: any) {
    console.error('Gmail send error:', err);
    throw err;
  }
}

/**
 * Get the history of sent emails this session
 */
export function getSentEmailHistory(): SentEmailLogItem[] {
  return [...sentEmailHistory];
}

// ----------------------------------------------------
// EMAIL HTML TEMPLATES (Modern, Logistics-Branded)
// ----------------------------------------------------

export function buildBookingEmailTemplate(
  shipment: Shipment,
  companySettings: CompanySettings
): { subject: string; htmlBody: string } {
  const subject = `[Efricken Express] Booking Confirmed: Waybill #${shipment.trackingNumber}`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background: #f59e0b; color: #000; font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .title { margin: 8px 0 4px; font-size: 22px; font-weight: 700; color: #ffffff; }
    .content { padding: 28px; }
    .badge-code { background: #fef3c7; color: #b45309; padding: 6px 14px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: 700; display: inline-block; border: 1px solid #fde68a; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table td.label { font-weight: 600; color: #64748b; width: 38%; }
    .btn { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 16px 0; text-align: center; }
    .mpesa-banner { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">EFRICKEN EXPRESS</div>
      <h1 class="title">Waybill Confirmation</h1>
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">Fast, Reliable & Transparent Courier Services</p>
    </div>
    <div class="content">
      <p>Hello <strong>${shipment.senderName}</strong>,</p>
      <p>Your delivery request has been officially recorded in our dispatch system. Here are your consignment details:</p>
      
      <div style="text-align: center; margin: 16px 0;">
        <span class="badge-code">${shipment.trackingNumber}</span>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">Service Type:</td>
          <td><strong>${shipment.serviceType.replace('_', ' ').toUpperCase()}</strong></td>
        </tr>
        <tr>
          <td class="label">Pickup Location:</td>
          <td>${shipment.senderAddress} (${shipment.senderZone})</td>
        </tr>
        <tr>
          <td class="label">Destination:</td>
          <td>${shipment.recipientAddress} (${shipment.recipientZone})</td>
        </tr>
        <tr>
          <td class="label">Recipient:</td>
          <td>${shipment.recipientName} (${shipment.recipientPhone})</td>
        </tr>
        <tr>
          <td class="label">Billable Weight:</td>
          <td>${shipment.pricing.billableWeightKg} kg</td>
        </tr>
        <tr>
          <td class="label">Total Amount:</td>
          <td><strong style="color: #0f172a; font-size: 16px;">KES ${shipment.pricing.totalKes.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td class="label">Payment Status:</td>
          <td><strong style="color: ${shipment.paymentStatus === 'completed' ? '#059669' : '#d97706'};">${shipment.paymentStatus.toUpperCase()}</strong></td>
        </tr>
      </table>

      <div class="mpesa-banner">
        <strong style="color: #065f46;">💰 M-Pesa Buy Goods Payment Details:</strong><br>
        <span style="font-size: 13px; color: #047857;">
          Till Number: <strong>${companySettings.mpesaTillNumber || '3020057'}</strong><br>
          Store Name: <strong>${companySettings.companyName}</strong><br>
          Account Reference: <strong>${shipment.trackingNumber}</strong>
        </span>
      </div>

      <div style="text-align: center;">
        <a href="https://wa.me/254${(companySettings.whatsappNumber || '0796333235').replace(/^0/, '')}?text=Hello%20Efricken%20Express,%20inquiry%20on%20${shipment.trackingNumber}" class="btn">
          💬 WhatsApp Live Support
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
        Headquarters: <strong>${companySettings.headOfficeAddress || 'Nairobi, Tsavo Rd, Eliana Shoppers, Rm 5'}</strong><br>
        Telephone: <strong>${companySettings.supportPhone || '0796333235'}</strong>
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${companySettings.companyName}. All rights reserved.<br>
      This email was generated and sent via official Efricken Express Dispatch Systems.
    </div>
  </div>
</body>
</html>
  `;
  return { subject, htmlBody };
}

export function buildStatusUpdateEmailTemplate(
  shipment: Shipment,
  statusLabel: string,
  notes: string,
  companySettings: CompanySettings
): { subject: string; htmlBody: string } {
  const subject = `[Efricken Express] Status Update: ${shipment.trackingNumber} is now "${statusLabel}"`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
    .title { margin: 8px 0 4px; font-size: 20px; font-weight: 700; color: #ffffff; }
    .content { padding: 28px; }
    .status-pill { background: #f59e0b; color: #000; padding: 8px 18px; border-radius: 9999px; font-weight: 700; font-size: 15px; display: inline-block; margin: 12px 0; }
    .route-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 14px; }
    .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="background: #f59e0b; color: #000; font-weight: 800; font-size: 12px; padding: 3px 10px; border-radius: 9999px; display: inline-block; text-transform: uppercase;">Efricken Express Dispatch</div>
      <h1 class="title">Shipment Progress Notification</h1>
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">Waybill: ${shipment.trackingNumber}</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>There is a new operational milestone for your package:</p>
      
      <div style="text-align: center;">
        <span class="status-pill">${statusLabel}</span>
      </div>

      ${notes ? `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; font-size: 14px; color: #92400e;"><strong>Dispatch Note:</strong> ${notes}</div>` : ''}

      <div class="route-box">
        <strong>Origin:</strong> ${shipment.senderAddress} (${shipment.senderZone})<br>
        <strong>Destination:</strong> ${shipment.recipientAddress} (${shipment.recipientZone})<br>
        <strong>Recipient:</strong> ${shipment.recipientName} (${shipment.recipientPhone})
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Need assistance or want to reschedule? Call our dispatch hotline at <strong>${companySettings.supportPhone || '0796333235'}</strong> or reply to this email.
      </p>
    </div>
    <div class="footer">
      Headquarters: ${companySettings.headOfficeAddress || 'Nairobi, Tsavo Rd, Eliana Shoppers, Rm 5'}<br>
      &copy; ${new Date().getFullYear()} ${companySettings.companyName}.
    </div>
  </div>
</body>
</html>
  `;
  return { subject, htmlBody };
}

export function buildPODEmailTemplate(
  shipment: Shipment,
  pod: ProofOfDelivery,
  companySettings: CompanySettings
): { subject: string; htmlBody: string } {
  const subject = `[Efricken Express] Delivered & Signed: Waybill #${shipment.trackingNumber}`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #065f46; padding: 24px; text-align: center; color: #ffffff; }
    .title { margin: 8px 0 4px; font-size: 22px; font-weight: 700; color: #ffffff; }
    .content { padding: 28px; }
    .pod-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .sig-img { max-width: 220px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; padding: 4px; }
    .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="background: #34d399; color: #064e3b; font-weight: 800; font-size: 12px; padding: 3px 10px; border-radius: 9999px; display: inline-block;">DELIVERY SUCCESSFUL</div>
      <h1 class="title">Proof of Delivery (POD)</h1>
      <p style="margin: 0; color: #a7f3d0; font-size: 13px;">Waybill: ${shipment.trackingNumber}</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We are delighted to confirm that your shipment has been safely delivered and signed for by the consignee.</p>

      <div class="pod-box">
        <p style="margin: 4px 0;"><strong>Received By:</strong> ${pod.recipientName}</p>
        ${pod.recipientPhone ? `<p style="margin: 4px 0;"><strong>Recipient Phone:</strong> ${pod.recipientPhone}</p>` : ''}
        ${pod.recipientIdNumber ? `<p style="margin: 4px 0;"><strong>National ID:</strong> ${pod.recipientIdNumber}</p>` : ''}
        <p style="margin: 4px 0;"><strong>Delivery Timestamp:</strong> ${new Date(pod.timestamp).toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Delivered By Rider:</strong> ${pod.riderName} (${pod.riderId})</p>
        ${pod.notes ? `<p style="margin: 4px 0;"><strong>Rider Note:</strong> ${pod.notes}</p>` : ''}
        ${
          pod.signatureDataUrl
            ? `<div style="margin-top: 12px;"><strong>Consignee Signature:</strong><br><img src="${pod.signatureDataUrl}" alt="Signature" class="sig-img" /></div>`
            : ''
        }
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Thank you for choosing <strong>${companySettings.companyName}</strong>. If you have any questions regarding this delivery, please reach us on <strong>${companySettings.supportPhone || '0796333235'}</strong>.
      </p>
    </div>
    <div class="footer">
      ${companySettings.headOfficeAddress || 'Nairobi, Tsavo Rd, Eliana Shoppers, Rm 5'}<br>
      &copy; ${new Date().getFullYear()} ${companySettings.companyName}. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
  return { subject, htmlBody };
}

export function buildPaymentReceiptEmailTemplate(
  shipment: Shipment,
  payment: PaymentRecord,
  companySettings: CompanySettings
): { subject: string; htmlBody: string } {
  const subject = `[Efricken Express] Payment Receipt: KES ${payment.amountKes.toLocaleString()} (M-Pesa Ref: ${payment.mpesaReceiptNumber || 'Till 3020057'})`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
    .content { padding: 28px; }
    .receipt-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">Official Payment Receipt</h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Efricken Express - Till 3020057</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your payment for shipment <strong>${shipment.trackingNumber}</strong> has been received and verified.</p>
      
      <div class="receipt-box">
        <p style="margin: 4px 0;"><strong>Receipt / Trans Ref:</strong> ${payment.mpesaReceiptNumber || payment.id}</p>
        <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${payment.method.toUpperCase()} (Till: ${companySettings.mpesaTillNumber || '3020057'})</p>
        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> KES ${payment.amountKes.toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(payment.transactionDate).toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">VERIFIED</span></p>
      </div>
      
      <p style="font-size: 13px; color: #64748b;">
        Efricken Express | ${companySettings.headOfficeAddress || 'Nairobi, Tsavo Rd, Eliana Shoppers, Rm 5'} | Phone: ${companySettings.supportPhone || '0796333235'}
      </p>
    </div>
  </div>
</body>
</html>
  `;
  return { subject, htmlBody };
}
