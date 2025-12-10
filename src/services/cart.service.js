import prisma from "../prisma.js";
import { getMerchandiseById, decreaseStock } from "./merchandise.service.js";

export async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { items: { include: { merchandise: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: "ACTIVE",
      },
      include: { items: { include: { merchandise: true } } },
    });
  }

  return cart;
}

export async function getCartById(cartId) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { merchandise: true } } },
  });

  if (!cart) {
    throw new Error("Carrinho não encontrado.");
  }

  return cart;
}

export async function addItemToCart(userId, merchandiseId, quantity) {
  if (!quantity || quantity <= 0) {
    throw new Error("Quantidade deve ser maior que 0.");
  }

  const merchandise = await getMerchandiseById(merchandiseId);

  if (merchandise.stock < quantity) {
    throw new Error("Stock insuficiente para esta quantidade.");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, merchandiseId },
  });

  let cartItem;
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (merchandise.stock < newQuantity) {
      throw new Error("Stock insuficiente para esta quantidade total.");
    }

    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { merchandise: true },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        merchandiseId,
        quantity,
        unitPrice: merchandise.price,
      },
      include: { merchandise: true },
    });
  }

  return cartItem;
}

export async function removeItemFromCart(cartItemId) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error("Item do carrinho não encontrado.");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  if (!quantity || quantity <= 0) {
    throw new Error("Quantidade deve ser maior que 0.");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { merchandise: true },
  });

  if (!cartItem) {
    throw new Error("Item do carrinho não encontrado.");
  }

  if (cartItem.merchandise.stock < quantity) {
    throw new Error("Stock insuficiente para esta quantidade.");
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { merchandise: true },
  });

  return updated;
}

export async function clearCart(cartId) {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
}

export async function completeCart(cartId) {
  const cart = await getCartById(cartId);

  for (const item of cart.items) {
    await decreaseStock(item.merchandiseId, item.quantity);
  }

  const completed = await prisma.cart.update({
    where: { id: cartId },
    data: { status: "COMPLETED" },
    include: { items: { include: { merchandise: true } } },
  });

  return completed;
}

export async function cancelCart(cartId) {
  const cart = await prisma.cart.update({
    where: { id: cartId },
    data: { status: "CANCELED" },
    include: { items: { include: { merchandise: true } } },
  });

  return cart;
}

export async function getCartTotal(cartId) {
  const cart = await getCartById(cartId);
  
  const total = cart.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  return {
    cartId,
    totalItems: cart.items.length,
    totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: parseFloat(total.toFixed(2)),
    items: cart.items,
  };
}
