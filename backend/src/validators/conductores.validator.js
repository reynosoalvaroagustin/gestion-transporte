import { body } from 'express-validator';

export const conductorRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 80 }),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio').isLength({ max: 80 }),
  body('numero_documento').trim().matches(/^[0-9]{6,12}$/).withMessage('Documento inválido (6 a 12 dígitos)'),
  body('numero_licencia').trim().notEmpty().withMessage('El número de licencia es obligatorio').isLength({ max: 30 }),
  body('fecha_alta_licencia').isISO8601({ strict: true }).withMessage('Fecha de alta inválida (AAAA-MM-DD)'),
  body('fecha_vencimiento_licencia')
    .isISO8601({ strict: true }).withMessage('Fecha de vencimiento inválida (AAAA-MM-DD)')
    .custom((v, { req }) => v > req.body.fecha_alta_licencia)
    .withMessage('El vencimiento debe ser posterior al alta'),
];