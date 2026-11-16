import { Router } from 'express';
import * as c from '../controllers/vehiculos.controller.js';
import { idRule, listRules, vehiculoRules } from '../validators/vehiculos.validator.js';
import { validar } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.js';
import { ah } from '../middlewares/asyncHandler.js';

const r = Router();
r.use(autenticar);
r.get('/', listRules, validar, ah(c.listar));
r.get('/:id', idRule, validar, ah(c.obtener));
r.post('/', vehiculoRules, validar, ah(c.crear));
r.put('/:id', idRule, vehiculoRules, validar, ah(c.actualizar));
r.delete('/:id', idRule, validar, ah(c.eliminar));
export default r;