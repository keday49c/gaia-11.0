import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

const DEMO_CAMPAIGNS = [
  {
    id: '1',
    nome: 'Black Friday 2025',
    descricao: 'Campanha de Black Friday com desconto de 50%',
    status: 'ativa',
    tipo: 'promocao',
    plataforma: 'google_ads',
    cliques: 5420,
    impressoes: 125000,
    conversoes: 542,
    orcamento: 5000,
    ctr: 4.34,
    cpc: 0.92,
    roi: 285.5,
  },
  {
    id: '2',
    nome: 'Lançamento Produto X',
    descricao: 'Campanha de lançamento do novo produto X',
    status: 'ativa',
    tipo: 'lancamento',
    plataforma: 'instagram',
    cliques: 8920,
    impressoes: 250000,
    conversoes: 892,
    orcamento: 8000,
    ctr: 3.57,
    cpc: 0.89,
    roi: 312.8,
  },
  {
    id: '3',
    nome: 'Reengajamento WhatsApp',
    descricao: 'Campanha de reengajamento via WhatsApp',
    status: 'pausada',
    tipo: 'reengajamento',
    plataforma: 'whatsapp',
    cliques: 3200,
    impressoes: 45000,
    conversoes: 320,
    orcamento: 2000,
    ctr: 7.11,
    cpc: 6.25,
    roi: 425.0,
  },
  {
    id: '4',
    nome: 'Webinar Gratuito',
    descricao: 'Campanha para promover webinar gratuito',
    status: 'ativa',
    tipo: 'webinar',
    plataforma: 'google_ads',
    cliques: 2150,
    impressoes: 85000,
    conversoes: 215,
    orcamento: 1500,
    ctr: 2.53,
    cpc: 0.70,
    roi: 198.3,
  },
  {
    id: '5',
    nome: 'Programa de Afiliados',
    descricao: 'Campanha para recrutar afiliados',
    status: 'rascunho',
    tipo: 'afiliacao',
    plataforma: 'instagram',
    cliques: 0,
    impressoes: 0,
    conversoes: 0,
    orcamento: 3000,
    ctr: 0,
    cpc: 0,
    roi: 0,
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Se for visitante, retornar campanhas de demo
      if (decoded.isGuest) {
        return res.json({
          success: true,
          data: DEMO_CAMPAIGNS,
        });
      }

      // Retornar campanhas do usuário (em produção, buscar no banco de dados)
      return res.json({
        success: true,
        data: DEMO_CAMPAIGNS,
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
