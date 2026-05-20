import * as DeepSeek from "./ai-providers/deepseek.provider.js";
import * as Mock from "./ai-providers/mock.provider.js";

const PROVIDER = (process.env.AI_PROVIDER || "mock").toLowerCase();
const providers = { deepseek: DeepSeek, mock: Mock };

async function callAI(prompt) {
  const provider = providers[PROVIDER];
  if (!provider || typeof provider.call !== "function") {
    throw new Error(`AI provider not available or not configured: ${PROVIDER}`);
  }
  return provider.call(prompt);
}

export async function generateSuggestedCourse(answers) {
  const prompt = `Given these user answers: ${JSON.stringify(answers)}\nReturn a short JSON object with keys: title, outline (array of levels with tasks).`;
  return callAI(prompt);
}

export async function generateFullCourseMap(answers) {
  const prompt = `Create a detailed gamified course map based on these answers: ${JSON.stringify(answers)}\nReturn a JSON object with: title, description, levels: [{id,title,description,tasks:[{id,type,question,code_stub,points}]}].`;
  return callAI(prompt);
}

export default { generateSuggestedCourse, generateFullCourseMap };
