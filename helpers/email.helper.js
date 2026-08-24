const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const ejs = require("ejs");
const environment = require("../utils/environment");

sgMail.setApiKey(environment.sendgrid.apiKey);

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const emailHelper = {};

/**
 * Renders an EJS template on disk and sends it via SendGrid.
 * @param {string} templatePath - path to an .ejs file
 * @param {{to: string|string[], cc?: string|string[], subject: string, from?: string, attachments?: any[]}} options
 * @param {object} data - template locals
 */
emailHelper.sendHtmlEmail = async (templatePath, options, data) => {
  const toEmails = (Array.isArray(options.to) ? options.to : [options.to])
    .filter(Boolean)
    .map((e) => String(e).toLowerCase().trim())
    .filter(isValidEmail);

  if (toEmails.length === 0) {
    console.warn("sendHtmlEmail skipped: missing recipient email.", JSON.stringify({ subject: options?.subject }));
    return { status: 0, skipped: true, error: "'to' email address is missing or empty." };
  }

  let ccEmails = [];
  if (options.cc) {
    ccEmails = (Array.isArray(options.cc) ? options.cc : [options.cc])
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim())
      .filter(isValidEmail)
      .filter((e) => !toEmails.includes(e));
    ccEmails = [...new Set(ccEmails)];
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const msg = {
    to: toEmails.length === 1 ? toEmails[0] : toEmails,
    from: options.from || { email: environment.sendgrid.senderEmail, name: environment.sendgrid.senderName },
    subject: options.subject,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    html: await ejs.render(template, data, { async: true }),
    ...(options.attachments ? { attachments: options.attachments } : {}),
  };

  try {
    const response = await sgMail.send(msg);
    return {
      status: 1,
      statusCode: response?.[0]?.statusCode,
      headers: response?.[0]?.headers,
    };
  } catch (error) {
    console.error("sendHtmlEmail error:", error?.response?.body || error.message);
    throw error;
  }
};

/**
 * Sends raw HTML directly (no template file on disk) — used for one-off blasts
 * like the multi-insurer quote request email.
 * @param {{to: string|string[], cc?: string|string[], subject: string, html: string, from?: string}} options
 */
emailHelper.sendRawHtmlEmail = async (options) => {
  const toEmails = (Array.isArray(options.to) ? options.to : [options.to])
    .filter(Boolean)
    .map((e) => String(e).toLowerCase().trim())
    .filter(isValidEmail);

  if (toEmails.length === 0) {
    throw new Error("sendRawHtmlEmail: 'to' email address is missing or empty.");
  }

  let ccEmails = [];
  if (options.cc) {
    ccEmails = (Array.isArray(options.cc) ? options.cc : [options.cc])
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim())
      .filter(isValidEmail)
      .filter((e) => !toEmails.includes(e));
    ccEmails = [...new Set(ccEmails)];
  }

  const msg = {
    to: toEmails.length === 1 ? toEmails[0] : toEmails,
    from: options.from || { email: environment.sendgrid.senderEmail, name: environment.sendgrid.senderName },
    subject: options.subject,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    html: options.html,
  };

  const response = await sgMail.send(msg);
  return { status: 1, statusCode: response?.[0]?.statusCode };
};

module.exports = emailHelper;
