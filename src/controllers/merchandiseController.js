import * as merchandiseService from '../services/merchandise.service.js';

export const createMerchandise = async (req, res) => {
    // Apenas ADMIN pode criar
    try {
        const merchandise = await merchandiseService.createMerchandise(req.body);
        res.status(201).json(merchandise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllMerchandise = async (req, res) => {
    try {
        const merchandise = await merchandiseService.getAllMerchandise();
        res.status(200).json(merchandise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMerchandise = async (req, res) => {
    // Apenas ADMIN pode atualizar
    try {
        const merchandise = await merchandiseService.updateMerchandise(parseInt(req.params.id, 10), req.body);
        res.status(200).json(merchandise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMerchandise = async (req, res) => {
    // Apenas ADMIN pode deletar
    try {
        await merchandiseService.deleteMerchandise(parseInt(req.params.id, 10));
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};