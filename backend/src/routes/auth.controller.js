import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const firmar = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '4h' });

export const register = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ message: 'El email ya está registrado' });

  const hash = await bcrypt.hash(contrasena, 10);
  const [r] = await pool.query('INSERT INTO usuarios (nombre, email, contrasena) VALUES (?,?,?)', [nombre, email, hash]);
  const user = { id: r.insertId, nombre, email };
  res.status(201).json({ user, token: firmar(user) });
};

export const login = async (req, res) => {
  const { email, contrasena } = req.body;
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(contrasena, u.contrasena)))
    return res.status(401).json({ message: 'Credenciales inválidas' });

  res.json({ user: { id: u.id, nombre: u.nombre, email: u.email }, token: firmar(u) });
};

export const perfil = (req, res) => res.json(req.user);