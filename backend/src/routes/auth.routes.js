import { Router } from 'express';
import { register, login, perfil } from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validar } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.js';
import { ah } from '../middlewares/asyncHandler.js';

const r = Router();
r.post('/register', registerRules, validar, ah(register));
r.post('/login', loginRules, validar, ah(login));
r.get('/perfil', autenticar, perfil);
export default r;
