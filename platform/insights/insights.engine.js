const Anthropic = require("@anthropic-ai/sdk");
const environment = require("../../utils/environment");

const anthropic = new Anthropic({ apiKey: environment.anthropic.apiKey });

/**
 * Generic Claude tool-use caller shared by every module's "Insights" feature.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {object[]} [tools] - Anthropic tool definitions
 * @param {string} [model]
 */
exports.runInsight = async (systemPrompt, userMessage, tools = [], model = "claude-sonnet-4-5") => {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    ...(tools.length ? { tools } : {}),
  });

  return response;
};
