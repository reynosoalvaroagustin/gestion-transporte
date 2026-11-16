import { body, param, query } from 'express-validator';

const anioMax = new Date().getFullYear() + 1;

export const idRule = [param('id').isInt({ min: 1 }).withMessage('ID inválido').toInt()];

export const listRules = [query('buscar').optional().trim().isLength({ max: 50 })];

export const vehiculoRules = [
  body('marca').trim().notEmpty().withMessage('La marca es obligatoria').isLength({ max: 50 }),
  body('modelo').trim().notEmpty().withMessage('El modelo es obligatorio').isLength({ max: 50 }),
  body('patente')
    .trim().toUpperCase()
    .matches(/^[A-Z0-9 -]{6,10}$/).withMessage('Patente inválida (6 a 10 caracteres alfanuméricos)'),
  body('anio').isInt({ min: 1950, max: anioMax }).withMessage(`El año debe estar entre 1950 y ${anioMax}`),
  body('capacidad_carga').isFloat({ gt: 0 }).withMessage('La capacidad de carga debe ser mayor a 0'),
];