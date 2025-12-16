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

  // Build a strict prompt asking for only valid JSON with the expected schema
  const prompt = `You are a marketing analyst assistant. Analyze the campaign and return ONLY valid JSON, matching this schema exactly (no additional text):\n{\n  "score": <integer 0-100>,\n  "recommendations": ["string", ...],\n  "observations": "string"\n}\nProvide concise, actionable recommendations.\n\nCampaign: ${JSON.stringify(campaign, null, 2)}\nRecent metrics: ${JSON.stringify(metrics, null, 2)}\nReturn only JSON.`;

  let result: any;
  if (PROVIDER.toLowerCase() === 'openai') {
    result = await callOpenAI(prompt);
  } else if (PROVIDER.toLowerCase() === 'gemini' || PROVIDER.toLowerCase() === 'google') {
    result = await callGemini(prompt);
  } else {
    throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}`);
  }

  // If the model returned parseable JSON, validate and normalize it; otherwise attempt to extract/validate
  let parsed = result.parsed || null;

  function normalize(parsedObj: any) {
    const out: any = { score: null, recommendations: [], observations: '' };
    if (!parsedObj) return out;
    // score: number 0-100
    const score = Number(parsedObj.score ?? parsedObj.pontuacao ?? parsedObj.score_raw);
    out.score = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
    // recommendations: array of strings
    const recs = parsedObj.recommendations || parsedObj.recomendacoes || parsedObj.recomendacoes || parsedObj.recs;
    if (Array.isArray(recs)) out.recommendations = recs.map((r: any) => String(r).trim()).filter(Boolean);
    // observations / observacoes
    out.observations = String(parsedObj.observations || parsedObj.observacoes || parsedObj.note || parsedObj.observacao || '') || '';
    return out;
  }

  let normalized = normalize(parsed);

  // If parsing failed, try to extract JSON from raw text then normalize
  if (!parsed) {
    try {
      const heuristic = extractJSON(result.raw || '');
      if (heuristic) {
        parsed = heuristic;
        normalized = normalize(parsed);
      }
    } catch (err) {
      // ignore
    }
  }

  // Persist analysis in DB storing normalized fields and raw response
  const insert = await pool.query(
    'INSERT INTO analyses (campaign_id, provider, score, recommendations, raw_response) VALUES ($1, $2, $3, $4, $5) RETURNING id, criado_em',
    [campaign.id, result.provider, normalized.score, JSON.stringify(normalized.recommendations), { raw: result.raw }]
  );

  return {
    id: insert.rows[0].id,
    criado_em: insert.rows[0].criado_em,
    provider: result.provider,
    parsed: normalized,
    raw: result.raw,
  };
}

export function isAIConfigured() {
  if (PROVIDER.toLowerCase() === 'openai') return !!OPENAI_KEY;
  if (PROVIDER.toLowerCase() === 'gemini' || PROVIDER.toLowerCase() === 'google') return !!GEMINI_KEY;
  return false;
}

export default { analyzeCampaignWithAI, isAIConfigured };
