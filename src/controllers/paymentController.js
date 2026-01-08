import * as paymentService from '../services/payment.service.js';
import prisma from '../prisma.js';

export const createCheckout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar carrinho ativo do utilizador
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        error: 'Carrinho vazio. Adicione items antes de fazer checkout.' 
      });
    }

    const session = await paymentService.createCheckoutSession(userId, cart.id);

    res.json({
      message: 'Sessão de checkout criada com sucesso.',
      sessionId: session.sessionId,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID não fornecido.' });
    }

    const order = await paymentService.handlePaymentSuccess(session_id);

    res.json({
      message: 'Pagamento processado com sucesso!',
      order,
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleCancel = async (req, res) => {
  res.json({
    message: 'Pagamento cancelado. O seu carrinho ainda está disponível.',
  });
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const details = await paymentService.getPaymentDetails(sessionId);

    res.json(details);
  } catch (error) {
    console.error('Erro ao obter detalhes do pagamento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const refundOrder = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verificar se o utilizador é admin
    if (!req.user.superAdmin && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para fazer reembolsos.' });
    }

    const refund = await paymentService.refundPayment(sessionId);

    res.json({
      message: 'Reembolso processado com sucesso.',
      refund,
    });
  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    res.status(500).json({ error: error.message });
  }
};
