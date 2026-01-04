import express from 'express';
import bodyParser from 'body-parser';
import { checkHasAdmin } from '../../lib/admin';

const app = express();
app.use(bodyParser.json());

app.get('/auth/has-admin', async (req, res) => {
  try {
    const hasAdmin = await checkHasAdmin();
    return res.json({ success: true, data: { hasAdmin } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

export default app;
