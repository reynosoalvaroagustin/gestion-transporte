import { pool } from '../config/db.js';

const SELECT = `
  SELECT v.*,
    CONCAT(ve.marca, ' ', ve.modelo, ' (', ve.patente, ')') AS vehiculo,
    CONCAT(c.nombre, ' ', c.apellido) AS conductor
  FROM viajes v
  JOIN vehiculos ve ON ve.id = v.vehiculo_id
  JOIN conductores c ON c.id = v.conductor_id`;

const aSql = (f) => f.replace('T', ' ').slice(0, 19);

const validarRelaciones = async ({ vehiculo_id, conductor_id, fecha_salida }) => {
  const [[veh]] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
  if (!veh) return { status: 404, message: 'Vehículo no encontrado' };
  const [[con]] = await pool.query('SELECT fecha_vencimiento_licencia FROM conductores WHERE id = ?', [conductor_id]);
  if (!con) return { status: 404, message: 'Conductor no encontrado' };
  if (con.fecha_vencimiento_licencia < fecha_salida.slice(0, 10))
    return { status: 403, message: 'El conductor tenía la licencia vencida en la fecha de salida' };
  return null;
};

export const listar = async (req, res) => {
  const cond = [];
  const params = [];
  if (req.query.vehiculo_id) { cond.push('v.vehiculo_id = ?'); params.push(req.query.vehiculo_id); }
  if (req.query.conductor_id) { cond.push('v.conductor_id = ?'); params.push(req.query.conductor_id); }
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const [viajes] = await pool.query(`${SELECT} ${where} ORDER BY v.fecha_salida DESC`, params);
  const total_km = viajes.reduce((acc, v) => acc + Number(v.kilometros), 0);
  res.json({ viajes, total_km });
};

export const obtener = async (req, res) => {
  const [rows] = await pool.query(`${SELECT} WHERE v.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.json(rows[0]);
};

export const crear = async (req, res) => {
  const b = req.body;
  const err = await validarRelaciones(b);
  if (err) return res.status(err.status).json({ message: err.message });
  const [r] = await pool.query(
    `INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
     VALUES (?,?,?,?,?,?,?,?)`,
    [b.vehiculo_id, b.conductor_id, aSql(b.fecha_salida), aSql(b.fecha_llegada), b.origen, b.destino, b.kilometros, b.observaciones || null]
  );
  res.status(201).json({ id: r.insertId, ...b });
};

export const actualizar = async (req, res) => {
  const b = req.body;
  const err = await validarRelaciones(b);
  if (err) return res.status(err.status).json({ message: err.message });
  const [r] = await pool.query(
    `UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, origen=?, destino=?,
     kilometros=?, observaciones=? WHERE id=?`,
    [b.vehiculo_id, b.conductor_id, aSql(b.fecha_salida), aSql(b.fecha_llegada), b.origen, b.destino, b.kilometros, b.observaciones || null, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.json({ id: req.params.id, ...b });
};

export const eliminar = async (req, res) => {
  const [r] = await pool.query('DELETE FROM viajes WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.status(204).send();
};