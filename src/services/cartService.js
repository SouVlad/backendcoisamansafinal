import prisma from '../prisma.js';

const findOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findFirst({
        where: { 
            userId,
            status: 'ACTIVE'
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
        });
    }

    return cart;
};

export const findCartByUserId = async (userId) => {
    const cart = await prisma.cart.findFirst({
        where: { 
            userId,
            status: 'ACTIVE'
        },
        include: {
            items: {
                include: {
                    merchandise: true,
                },
            },
        },
    });

    // Se não existe carrinho, retorna um carrinho vazio
    if (!cart) {
        return {
            id: null,
            userId,
            status: 'ACTIVE',
            items: [],
            createdAt: null,
            updatedAt: null
        };
    }

    return cart;
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
        const newQuantity = existingItem.quantity + quantity;
        if (merchandise.stock < newQuantity - existingItem.quantity) {
            throw new Error('Stock insuficiente para esta quantidade total.');
        }
        
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
        });
        
        await prisma.merchandise.update({
            where: { id: merchandiseId },
            data: { stock: { decrement: quantity } },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                merchandiseId,
                quantity,
                unitPrice: merchandise.price,
            },
        });
        
        await prisma.merchandise.update({
            where: { id: merchandiseId },
            data: { stock: { decrement: quantity } },
        });
    }

    return findCartByUserId(userId);
};

export const removeItem = async (userId, itemId) => {
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { merchandise: true }
    });
    
    if (!cartItem) {
        throw new Error('Item não encontrado no carrinho.');
    }
    
    // Devolver o stock ao merchandise
    await prisma.merchandise.update({
        where: { id: cartItem.merchandiseId },
        data: { stock: { increment: cartItem.quantity } },
    });
    
    await prisma.cartItem.delete({ where: { id: itemId } });
    return findCartByUserId(userId);
};