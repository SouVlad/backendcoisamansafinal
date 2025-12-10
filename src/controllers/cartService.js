import prisma from '../prisma.js';

const findOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
        });
    }

    return cart;
};

export const findCartByUserId = async (userId) => {
    const cart = await findOrCreateCart(userId);
    return prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
            items: {
                include: {
                    merchandise: true,
                },
            },
        },
    });
};

export const addItem = async (userId, merchandiseId, quantity) => {
    const cart = await findOrCreateCart(userId);

    const merchandise = await prisma.merchandise.findUnique({ where: { id: merchandiseId } });
    if (!merchandise || merchandise.stock < quantity) {
        throw new Error('Produto indisponível ou quantidade insuficiente em estoque.');
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            merchandiseId,
        },
    });

    if (existingItem) {
        // Atualiza a quantidade se o item já existe
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
        });
    } else {
        // Cria um novo item no carrinho
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                merchandiseId,
                quantity,
            },
        });
    }

    // Reduz o estoque (idealmente, isso deveria ser feito em uma transação)
    await prisma.merchandise.update({
        where: { id: merchandiseId },
        data: { stock: { decrement: quantity } },
    });

    return findCartByUserId(userId);
};

export const removeItem = async (userId, itemId) => {
    // Adicionar lógica para devolver o item ao estoque se necessário
    await prisma.cartItem.delete({ where: { id: itemId } });
    return findCartByUserId(userId);
};