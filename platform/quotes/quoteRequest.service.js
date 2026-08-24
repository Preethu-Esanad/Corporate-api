const emailHelper = require("../../helpers/email.helper");
const InsuranceCompanyModel = require("../../models/insuranceCompany.model");

/**
 * Emails a quote request to every active insurer registered for a category.
 * @param {string} category - e.g. "group-health"
 * @param {{subject: string, html: string, cc?: string[]}} message
 * @returns {Promise<{sent: string[], skipped: string[]}>}
 */
exports.sendQuoteRequest = async (category, message) => {
  const insurers = await InsuranceCompanyModel.find({
    categories: category,
    isActive: true,
    isDeleted: false,
  });

  const sent = [];
  const skipped = [];

  await Promise.all(
    insurers.map(async (insurer) => {
      if (!insurer.email) {
        skipped.push(insurer.name);
        return;
      }
      try {
        await emailHelper.sendRawHtmlEmail({
          to: insurer.email,
          cc: message.cc,
          subject: message.subject,
          html: message.html,
        });
        sent.push(insurer.name);
      } catch (err) {
        console.error(`Quote request to ${insurer.name} failed:`, err.message);
        skipped.push(insurer.name);
      }
    })
  );

  return { sent, skipped };
};
