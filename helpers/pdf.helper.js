const { renderFile } = require("ejs");
const { launch } = require("puppeteer");
const { existsSync } = require("fs");
const { join } = require("path");
const storageHelper = require("./storage.helper");

const DEFAULT_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"];

let sharedBrowser = null;
let sharedBrowserLaunching = null;

function resolveChromeExecutable() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium-browser"];

  return candidates.find((p) => existsSync(p)) || null;
}

async function launchPdfBrowser() {
  const executablePath = resolveChromeExecutable();
  const opts = { headless: "new", args: DEFAULT_LAUNCH_ARGS, ...(executablePath ? { executablePath } : {}) };
  try {
    return await launch(opts);
  } catch (err) {
    throw new Error(
      `generatePDF: could not launch Chrome/Chromium. Install Chrome or set PUPPETEER_EXECUTABLE_PATH. ${err.message}`
    );
  }
}

async function getSharedBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;
  if (sharedBrowserLaunching) return sharedBrowserLaunching;
  sharedBrowserLaunching = launchPdfBrowser()
    .then((browser) => {
      sharedBrowser = browser;
      browser.on("disconnected", () => (sharedBrowser = null));
      return browser;
    })
    .finally(() => (sharedBrowserLaunching = null));
  return sharedBrowserLaunching;
}

/**
 * Renders an EJS template to PDF and uploads it to Azure Blob Storage.
 * @param {string} templatePath - path relative to this file, e.g. "../views/templates/comparison-table.ejs"
 * @param {object} data - template locals
 * @param {string} [filename]
 * @param {string} [folder]
 * @returns {Promise<{link: string, filename: string}>}
 */
exports.generatePDF = async (templatePath, data, filename, folder = "documents") => {
  let page;
  try {
    const browser = await getSharedBrowser();
    page = await browser.newPage();

    const html = await renderFile(join(__dirname, templatePath), data, { async: true });
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = Buffer.from(
      await page.pdf({ printBackground: true, format: "A4" })
    );
    await page.close().catch(() => {});
    page = null;

    const resolvedFilename = filename || `document-${Date.now()}`;
    const link = await storageHelper.uploadFile(pdfBuffer, `${resolvedFilename}.pdf`, folder);

    return { link, filename: `${resolvedFilename}.pdf` };
  } catch (error) {
    if (page) await page.close().catch(() => {});
    console.error("generatePDF error:", error);
    throw error;
  }
};
