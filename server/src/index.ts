import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, closePool } from './config/database';
import { ipMiddleware } from './middleware/auth';
import { loggerMiddleware } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import keysRoutes from './routes/keys';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(ipMiddleware);
app.use(loggerMiddleware);
app.use(generalLimiter);

// Rota de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas de chaves de API
app.use('/keys', keysRoutes);

// Rota de teste de conexão com banco
app.get('/test-db', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT NOW() as current_time');
    res.json({
      success: true,
      message: 'Conexão com banco de dados OK',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com banco de dados',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Tratamento de rotas não encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Tratamento de erros global
app.use((err: any, req: Request, res: Response) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor Gaia rodando em http://localhost:${PORT}`);
  console.log(`📝 CORS habilitado para: ${CORS_ORIGIN}`);
  console.log(`🔐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido. Encerrando gracefully...');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido. Encerrando gracefully...');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
});

export default app;

