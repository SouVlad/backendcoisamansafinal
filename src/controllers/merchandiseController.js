import * as merchandiseService from './merchandiseService.js';

export const createMerchandise = async (req, res) => {
    // Apenas ADMIN pode criar
    try {
        const merchandise = await merchandiseService.create(req.body);
        res.status(201).json(merchandise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllMerchandise = async (req, res) => {
    try {
        const merchandise = await merchandiseService.findAll();
        res.status(200).json(merchandise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMerchandise = async (req, res) => {
    // Apenas ADMIN pode atualizar
    try {
        const merchandise = await merchandiseService.update(req.params.id, req.body);
        res.status(200).json(merchandise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMerchandise = async (req, res) => {
    // Apenas ADMIN pode deletar
    try {
        await merchandiseService.remove(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};