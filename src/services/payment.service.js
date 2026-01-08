import Stripe from 'stripe';
import prisma from '../prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(userId, cartId) {
  // Buscar carrinho com items
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          merchandise: true,
        },
      },
    },
  });

  if (!cart || cart.userId !== userId) {
    throw new Error('Carrinho não encontrado ou não pertence ao utilizador.');
  }

  if (cart.items.length === 0) {
    throw new Error('Carrinho vazio. Adicione items antes de fazer checkout.');
  }

  // Criar line items para o Stripe
  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.merchandise.name,
        description: item.merchandise.description || '',
      },
      unit_amount: Math.round(item.unitPrice * 100), // Stripe usa centavos
    },
    quantity: item.quantity,
  }));

  // Criar sessão de checkout no Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
    metadata: {
      cartId: cart.id.toString(),
      userId: userId.toString(),
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function handlePaymentSuccess(sessionId) {
  // Buscar sessão no Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    throw new Error('Pagamento não foi concluído.');
  }

  const cartId = parseInt(session.metadata.cartId);
  const userId = parseInt(session.metadata.userId);

  // Buscar carrinho
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          merchandise: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error('Carrinho não encontrado.');
  }

  // Atualizar status do carrinho para COMPLETED
  await prisma.cart.update({
    where: { id: cartId },
    data: { status: 'COMPLETED' },
  });

  // Calcular total
  const total = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return {
    orderId: cart.id,
    status: 'COMPLETED',
    total,
    items: cart.items,
    paymentId: session.payment_intent,
  };
}

export async function getPaymentDetails(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  return {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total / 100, // Converter de centavos para euros
    currency: session.currency,
  };
}

export async function refundPayment(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (!session.payment_intent) {
    throw new Error('Nenhum pagamento encontrado para esta sessão.');
  }

  const refund = await stripe.refunds.create({
    payment_intent: session.payment_intent,
  });

  // Buscar carrinho da sessão
  const cartId = parseInt(session.metadata.cartId);
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  });

  if (cart) {
    // Devolver stock dos items
    for (const item of cart.items) {
      await prisma.merchandise.update({
        where: { id: item.merchandiseId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Atualizar status do carrinho
    await prisma.cart.update({
      where: { id: cartId },
      data: { status: 'CANCELED' },
    });
  }

  return {
    refundId: refund.id,
    status: refund.status,
    amount: refund.amount / 100,
  };
}
