import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger, maskEmail, maskPhone } from '../lib/core.js';

/**
 * Outbound OTP delivery.
 *  Email: any SMTP server (Gmail with an App password, Zoho, SES SMTP, Brevo…) or "console" in dev.
 *  SMS:   MSG91 (India, DLT OTP template) or Twilio, or "console" in dev.
 * The code is never logged outside console (development) mode.
 */
let transporter = null;
function mailer() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST, port: config.SMTP_PORT, secure: config.SMTP_SECURE,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    pool: true, maxConnections: 5, maxMessages: 200,
  });
  return transporter;
}

const PURPOSE_TEXT = {
  LOGIN: 'sign in to Saanvi Masale',
  LINK: 'verify this contact on your Saanvi Masale account',
  ADMIN_2FA: 'complete your Saanvi Masale admin sign-in',
};

export async function sendEmailOtp(to, code, purpose) {
  const minutes = Math.round(config.OTP_TTL_SECONDS / 60);
  const subject = `${code} is your Saanvi Masale verification code`;
  const text = `Your code to ${PURPOSE_TEXT[purpose]} is ${code}.\nIt expires in ${minutes} minutes. Never share this code with anyone — Saanvi Masale staff will never ask for it.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:16px">
    <h2 style="margin:0 0 4px;color:#D2161E">सान्वी मसाले</h2><p style="color:#555">Use this code to ${PURPOSE_TEXT[purpose]}:</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">${code}</p>
    <p style="color:#777;font-size:13px">It expires in ${minutes} minutes. Never share this code — our team will never ask for it. If you didn’t request it, you can ignore this email.</p></div>`;
  if (config.EMAIL_PROVIDER === 'console') {
    logger.info({ to: maskEmail(to), purpose }, `📧 [dev email] OTP ${code}`);
    return;
  }
  await mailer().sendMail({ from: config.EMAIL_FROM, to, subject, text, html });
  logger.info({ to: maskEmail(to), purpose }, 'otp email sent');
}

export async function sendSmsOtp(to, code, purpose) {
  const minutes = Math.round(config.OTP_TTL_SECONDS / 60);
  if (config.SMS_PROVIDER === 'console') {
    logger.info({ to: maskPhone(to), purpose }, `📱 [dev sms] OTP ${code}`);
    return;
  }
  const ctrl = AbortSignal.timeout(10_000);
  if (config.SMS_PROVIDER === 'msg91') {
    // MSG91 OTP API v5 — uses your DLT-approved template containing ##OTP##.
    const res = await fetch('https://control.msg91.com/api/v5/otp?' + new URLSearchParams({ template_id: config.MSG91_TEMPLATE_ID, mobile: to.replace('+', ''), otp: code, otp_expiry: String(minutes) }), {
      method: 'POST', headers: { authkey: config.MSG91_AUTH_KEY, 'content-type': 'application/json' }, body: '{}', signal: ctrl,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.type === 'error') throw new Error(`MSG91 error: ${body.message || res.status}`);
  } else if (config.SMS_PROVIDER === 'twilio') {
    const auth = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST', headers: { authorization: `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: config.TWILIO_FROM, Body: `${code} is your Saanvi Masale verification code. Valid for ${minutes} min. Do not share it with anyone.` }), signal: ctrl,
    });
    if (!res.ok) throw new Error(`Twilio error: ${res.status}`);
  }
  logger.info({ to: maskPhone(to), purpose }, 'otp sms sent');
}

