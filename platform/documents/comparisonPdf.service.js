const pdfHelper = require("../../helpers/pdf.helper");

/**
 * Renders the shared branded comparison table and uploads it to Azure Blob.
 * @param {object} comparisonData - { corporateCustomer, quotes: [...] } consumed by the EJS template
 * @param {string} [filename]
 * @returns {Promise<{link: string, filename: string}>}
 */
exports.generateComparisonPdf = async (comparisonData, filename) => {
  return pdfHelper.generatePDF(
    "../views/templates/comparison-table.ejs",
    comparisonData,
    filename,
    "comparisons"
  );
};
