import { body, query } from 'express-validator';

export const viajeRules = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('Vehículo obligatorio').toInt(),
  body('conductor_id').isInt({ min: 1 }).withMessage('Conductor obligatorio').toInt(),
  body('fecha_salida').isISO8601().withMessage('Fecha de salida inválida'),
  body('fecha_llegada')
    .isISO8601().withMessage('Fecha de llegada inválida')
    .custom((v, { req }) => new Date(v) >= new Date(req.body.fecha_salida))
    .withMessage('La llegada no puede ser anterior a la salida'),
  body('origen').trim().notEmpty().withMessage('El origen es obligatorio').isLength({ max: 120 }),
  body('destino').trim().notEmpty().withMessage('El destino es obligatorio').isLength({ max: 120 }),
  body('kilometros').isFloat({ gt: 0 }).withMessage('Los kilómetros deben ser mayores a 0'),
  body('observaciones').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

export const filtroViajesRules = [
  query('vehiculo_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('vehiculo_id inválido'),
  query('conductor_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('conductor_id inválido'),
];