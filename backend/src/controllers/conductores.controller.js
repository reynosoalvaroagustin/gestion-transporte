import { pool } from '../config/db.js';

const campos = (b) => [
  b.nombre, b.apellido, b.numero_documento, b.numero_licencia,
  b.fecha_alta_licencia, b.fecha_vencimiento_licencia,
];

export const listar = async (req, res) => {
  const b = `%${req.query.buscar || ''}%`;
  const [rows] = await pool.query(
    `SELECT * FROM conductores
     WHERE nombre LIKE ? OR apellido LIKE ? OR numero_documento LIKE ? ORDER BY id DESC`,
    [b, b, b]
  );
  res.json(rows);
};

export const obtener = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM conductores WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json(rows[0]);
};

export const crear = async (req, res) => {
  const [r] = await pool.query(
    `INSERT INTO conductores
     (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
     VALUES (?,?,?,?,?,?)`,
    campos(req.body)
  );
  res.status(201).json({ id: r.insertId, ...req.body });
};

export const actualizar = async (req, res) => {
  const [r] = await pool.query(
    `UPDATE conductores SET nombre=?, apellido=?, numero_documento=?, numero_licencia=?,
     fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?`,
    [...campos(req.body), req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json({ id: req.params.id, ...req.body });
};

export const eliminar = async (req, res) => {
  const [r] = await pool.query('DELETE FROM conductores WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.status(204).send();
};