import { pool } from '../config/db.js';

export const listar = async (req, res) => {
  const b = `%${req.query.buscar || ''}%`;
  const [rows] = await pool.query(
    'SELECT * FROM vehiculos WHERE marca LIKE ? OR modelo LIKE ? OR patente LIKE ? ORDER BY id DESC',
    [b, b, b]
  );
  res.json(rows);
};

export const obtener = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json(rows[0]);
};

export const crear = async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const [r] = await pool.query(
    'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)',
    [marca, modelo, patente, anio, capacidad_carga]
  );
  res.status(201).json({ id: r.insertId, marca, modelo, patente, anio, capacidad_carga });
};

export const actualizar = async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const [r] = await pool.query(
    'UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?',
    [marca, modelo, patente, anio, capacidad_carga, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json({ id: req.params.id, marca, modelo, patente, anio, capacidad_carga });
};

export const eliminar = async (req, res) => {
  const [r] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.status(204).send();
};