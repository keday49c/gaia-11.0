import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { query, closePool } from './config/database';
import { ipMiddleware } from './middleware/auth';
import { loggerMiddleware } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimiter';
import { validationMiddleware } from './middleware/validation';
import { detailedLoggerMiddleware } from './middleware/detailedLogger';
import authRoutes from './routes/auth';
import keysRoutes from './routes/keys';
import campaignsRoutes from './routes/campaigns';
import whatsappRoutes from './routes/whatsapp';
import testModeRoutes from './routes/testMode';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(ipMiddleware);
app.use(loggerMiddleware);
app.use(detailedLoggerMiddleware);
app.use(validationMiddleware);
app.use(generalLimiter);

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas de chaves de API
app.use('/keys', keysRoutes);

// Rotas de campanhas
app.use('/campaigns', campaignsRoutes);

// Rotas de WhatsApp
app.use('/whatsapp', whatsappRoutes);

// Rotas de modo teste
app.use('/test-mode', testModeRoutes);

// Rota de teste de conexão com banco
app.get('/test-db', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Conexão com banco de dados OK',
      timestamp: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com banco de dados',
    });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Gaia 10.0 rodando em http://localhost:${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Segurança: Blindada`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await closePool();
  process.exit(0);
});

export default app;

