import * as cartService from '../services/cartService.js';

export const getCart = async (req, res) => {
    try {
        const cart = await cartService.findCartByUserId(req.user.id);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addItemToCart = async (req, res) => {
    const { merchandiseId, quantity } = req.body;
    try {
        const cart = await cartService.addItem(req.user.id, merchandiseId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeItemFromCart = async (req, res) => {
    const { itemId } = req.params;
    try {
        const cart = await cartService.removeItem(req.user.id, parseInt(itemId, 10));
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};