import request from 'supertest';
import app from '../index';

// These tests are conditional: if AI_PROVIDER is not configured, the analyze endpoint returns 501

describe('Analyze endpoint', () => {
  it('returns 501 when AI not configured', async () => {
    const tmpEmail = `test+analyze+${Date.now()}@example.local`;
    // register
    const reg = await request(app).post('/auth/register').send({ email: tmpEmail, senha: 'password123' });
    expect(reg.status).toBe(200);
    const token = reg.body.data.token;

    // create campaign
    const create = await request(app).post('/campaigns/criar').set('Authorization', `Bearer ${token}`).send({ nome: 't', descricao: 'd' });
    expect(create.status).toBe(200);
    const campaignId = create.body.data.id;

    const res = await request(app).post(`/campaigns/${campaignId}/analisar`).set('Authorization', `Bearer ${token}`);

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      expect(res.status).toBe(501);
    } else {
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.parsed).toBeDefined();
      expect(res.body.data.parsed.recommendations).toBeDefined();
    }
  }, 30000);
});
