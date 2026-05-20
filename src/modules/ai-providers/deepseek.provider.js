// DeepSeek provider integration (stub).
// Configure with DEEPSEEK_API_KEY and optionally DEEPSEEK_API_URL.
const DEEPSEEK_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.example/v1/generate";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

export async function call(prompt) {
  if (!DEEPSEEK_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  // Try common fields then fall back to raw
  const content =
    json.output ||
    json.result ||
    json.choices?.[0]?.message?.content ||
    json.choices?.[0]?.text ||
    json;

  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (err) {
      return { rawText: content };
    }
  }

  return content;
}

export default { call };
