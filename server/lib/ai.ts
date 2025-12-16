import pool from '../db.js';

const PROVIDER = process.env.AI_PROVIDER || process.env.OPENAI_PROVIDER || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/text-bison-001';
const GEMINI_URL = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta2/${GEMINI_MODEL}:generateText`;

function extractJSON(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  const jsonStr = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

async function callOpenAI(prompt: string) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: 'You are a marketing analyst assistant.' }, { role: 'user', content: prompt }],
      max_tokens: 800,
    }),
  });
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
  const parsed = extractJSON(text) || null;
  return { provider: 'openai', raw: text, parsed };
}

async function callGemini(prompt: string) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not configured');
  const resp = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEMINI_KEY}`,
    },
    body: JSON.stringify({
      prompt: { text: prompt },
      maxOutputTokens: 800,
    }),
  });
  const data = await resp.json();
  const text = data?.candidates?.[0]?.output ?? JSON.stringify(data);
  const parsed = extractJSON(text) || null;
  return { provider: 'gemini', raw: text, parsed };
}

export async function analyzeCampaignWithAI(campaign: any, metrics: any[]) {
  if (!PROVIDER) throw new Error('AI_PROVIDER not configured');

  // Build prompt with campaign + recent metrics
  const prompt = `Analise esta campanha e gere um JSON com as chaves: score (0-100), recomendacoes (array de strings), observacoes (string).\nCampanha: ${JSON.stringify(campaign, null, 2)}\nMetricas recentes: ${JSON.stringify(metrics, null, 2)}\nResponda apenas com JSON válido.`;

  let result: any;
  if (PROVIDER.toLowerCase() === 'openai') {
    result = await callOpenAI(prompt);
  } else if (PROVIDER.toLowerCase() === 'gemini' || PROVIDER.toLowerCase() === 'google') {
    result = await callGemini(prompt);
  } else {
    throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}`);
  }

  // If the model returned parseable JSON, use it; otherwise attempt to extract fields heuristically
  const parsed = result.parsed || { score: null, recomendacoes: [], observacoes: result.raw };

  // Persist analysis in DB
  const insert = await pool.query(
    'INSERT INTO analyses (campaign_id, provider, score, recommendations, raw_response) VALUES ($1, $2, $3, $4, $5) RETURNING id, criado_em',
    [campaign.id, result.provider, parsed.score || null, parsed.recomendacoes ? parsed.recomendacoes : parsed.recommendations || [], { raw: result.raw }]
  );

  return {
    id: insert.rows[0].id,
    criado_em: insert.rows[0].criado_em,
    provider: result.provider,
    parsed,
    raw: result.raw,
  };
}

export function isAIConfigured() {
  if (PROVIDER.toLowerCase() === 'openai') return !!OPENAI_KEY;
  if (PROVIDER.toLowerCase() === 'gemini' || PROVIDER.toLowerCase() === 'google') return !!GEMINI_KEY;
  return false;
}

export default { analyzeCampaignWithAI, isAIConfigured };
