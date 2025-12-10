import prisma from '../prisma.js';

// Validação de entrada pode ser adicionada aqui com bibliotecas como Zod ou Joi

export const create = async (data) => {
    return prisma.merchandise.create({
        data,
    });
};

export const findAll = async () => {
    return prisma.merchandise.findMany();
};

export const update = async (id, data) => {
    return prisma.merchandise.update({
        where: { id: parseInt(id, 10) },
        data,
    });
};

export const remove = async (id) => {
    return prisma.merchandise.delete({
        where: { id: parseInt(id, 10) },
    });
};