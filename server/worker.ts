/**
 * Simple campaign worker
 * - Polls `campaigns` table for campaigns with status = 'ativa' and not yet published
 * - Simulates a publish action: marks campaign as published, inserts a metrics row and a logs entry
 * - Purpose: provide a lightweight, local-first worker to drive automation flows until real adapters are available
 */
import pool, { initializeDatabase } from './db.js';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_MS || 5000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensurePublishedColumn() {
  try {
    // Add a lightweight `publicado` flag to avoid re-publishing same campaign repeatedly
    await pool.query("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT false");
    console.log('✅ ensured campaigns.publicado column exists');
  } catch (err: any) {
    console.warn('⚠️ could not ensure publicado column (may already exist):', err?.message ?? String(err));
  }
}

// Create a deterministic pseudo-random helper for demo metric generation
function randomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function processOne(campaign: any) {
  const campaignId = campaign.id;
  console.log(`🚀 Publishing campaign ${campaignId} (${campaign.titulo || campaign.nome || 'sem-titulo'}) for user ${campaign.user_id}`);

  try {
    // Simulate network / publishing delay
    await sleep(800 + randomIntBetween(0, 1200));

    // Insert a metrics snapshot for the initial publish
    const impressoes = randomIntBetween(100, 2000);
    const cliques = Math.max(0, Math.floor(impressoes * (0.01 + Math.random() * 0.05)));
    const conversoes = Math.max(0, Math.floor(cliques * (0.01 + Math.random() * 0.15)));
    const custo = Number((Math.random() * 50).toFixed(2));
    const receita = Number((custo * (1 + Math.random() * 2)).toFixed(2));

    await pool.query(
      `INSERT INTO metrics (campaign_id, data, cliques, impressoes, conversoes, custo, receita) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)`,
      [campaignId, cliques, impressoes, conversoes, custo, receita]
    );

    // Update aggregate counters in campaigns table
    await pool.query(
      `UPDATE campaigns SET cliques = COALESCE(cliques,0) + $1, impressoes = COALESCE(impressoes,0) + $2, conversoes = COALESCE(conversoes,0) + $3, publicado = true, atualizado_em = CURRENT_TIMESTAMP WHERE id = $4`,
      [cliques, impressoes, conversoes, campaignId]
    );

    // Create a log entry referencing the campaign
    const detalhes = JSON.stringify({ action: 'published', campaignId, impressoes, cliques, conversoes, custo, receita });
    await pool.query(
      `INSERT INTO logs (user_id, acao, detalhes) VALUES ($1, $2, $3)`,
      [campaign.user_id, 'campaign_published', detalhes]
    );

    console.log(`✅ Campaign ${campaignId} published (impressoes=${impressoes} cliques=${cliques} conversoes=${conversoes})`);
  } catch (err: any) {
    console.error(`❌ Error publishing campaign ${campaignId}:`, err?.message ?? String(err));
  }
}

async function pollLoop() {
  console.log('🤖 Worker started - polling for campaigns to publish');
  await ensurePublishedColumn();

  while (true) {
    try {
      // Select campaigns that are active but not yet published
      const result = await pool.query(
        `SELECT * FROM campaigns WHERE status = $1 AND (publicado IS FALSE OR publicado IS NULL) ORDER BY criado_em ASC LIMIT 5`,
        ['ativa']
      );

      if (result.rows.length === 0) {
        // nothing to do right now
        // console.debug('no active campaigns found');
      } else {
        for (const c of result.rows) {
          await processOne(c);
        }
      }
    } catch (err: any) {
      console.error('❌ Worker loop error:', err?.message ?? String(err));
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

// Boot
(async () => {
  try {
    await initializeDatabase();
    await pollLoop();
  } catch (err: any) {
    console.error('❌ Worker failed to start:', err?.message ?? String(err));
    process.exit(1);
  }
})();
