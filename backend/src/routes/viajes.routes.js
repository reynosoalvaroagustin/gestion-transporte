import { Router } from 'express';
import * as c from '../controllers/viajes.controller.js';
import { idRule } from '../validators/vehiculos.validator.js';
import { viajeRules, filtroViajesRules } from '../validators/viajes.validator.js';
import { validar } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.js';
import { ah } from '../middlewares/asyncHandler.js';

const r = Router();
r.use(autenticar);
r.get('/', filtroViajesRules, validar, ah(c.listar));
r.get('/:id', idRule, validar, ah(c.obtener));
r.post('/', viajeRules, validar, ah(c.crear));
r.put('/:id', idRule, viajeRules, validar, ah(c.actualizar));
r.delete('/:id', idRule, validar, ah(c.eliminar));
export default r;