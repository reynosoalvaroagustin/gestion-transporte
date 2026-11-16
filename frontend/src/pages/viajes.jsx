import { useEffect, useState } from 'react';
import { api } from '../services/api';

const vacio = { vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '', origen: '', destino: '', kilometros: '', observaciones: '' };
const fmt = (s) => (s ? s.replace('T', ' ').slice(0, 16) : '');
const aInput = (s) => s.replace(' ', 'T').slice(0, 16);

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [totalKm, setTotalKm] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [filtro, setFiltro] = useState({ vehiculo_id: '', conductor_id: '' });
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    (async () => {
      try {
        setVehiculos(await api('/vehiculos'));
        setConductores(await api('/conductores'));
      } catch (e) { setMsg({ tipo: 'error', texto: e.message }); }
    })();
  }, []);

  const cargar = async () => {
    try {
      const qs = new URLSearchParams();
      if (filtro.vehiculo_id) qs.set('vehiculo_id', filtro.vehiculo_id);
      if (filtro.conductor_id) qs.set('conductor_id', filtro.conductor_id);
      const data = await api(`/viajes?${qs}`);
      setViajes(data.viajes);
      setTotalKm(data.total_km);
    } catch (e) { setMsg({ tipo: 'error', texto: e.message }); }
  };
  useEffect(() => { cargar(); }, [filtro]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const e = {};
    if (!form.vehiculo_id) e.vehiculo_id = 'Seleccioná un vehículo';
    if (!form.conductor_id) e.conductor_id = 'Seleccioná un conductor';
    if (!form.fecha_salida) e.fecha_salida = 'Obligatorio';
    if (!form.fecha_llegada) e.fecha_llegada = 'Obligatorio';
    else if (form.fecha_salida && form.fecha_llegada < form.fecha_salida) e.fecha_llegada = 'No puede ser anterior a la salida';
    if (!form.origen.trim()) e.origen = 'Obligatorio';
    if (!form.destino.trim()) e.destino = 'Obligatorio';
    if (!(Number(form.kilometros) > 0)) e.kilometros = 'Debe ser mayor a 0';
    return e;
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    try {
      const body = { ...form, vehiculo_id: Number(form.vehiculo_id), conductor_id: Number(form.conductor_id), kilometros: Number(form.kilometros) };
      await api(editId ? `/viajes/${editId}` : '/viajes', { method: editId ? 'PUT' : 'POST', body });
      setMsg({ tipo: 'ok', texto: editId ? 'Viaje actualizado' : 'Viaje registrado' });
      cancelar();
      cargar();
    } catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const editar = (v) => {
    setEditId(v.id);
    setForm({
      vehiculo_id: String(v.vehiculo_id), conductor_id: String(v.conductor_id),
      fecha_salida: aInput(v.fecha_salida), fecha_llegada: aInput(v.fecha_llegada),
      origen: v.origen, destino: v.destino, kilometros: String(v.kilometros), observaciones: v.observaciones || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => { setEditId(null); setForm(vacio); setErrores({}); };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    try { await api(`/viajes/${id}`, { method: 'DELETE' }); setMsg({ tipo: 'ok', texto: 'Viaje eliminado' }); cargar(); }
    catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const input = (name, label, type = 'text') => (
    <div className={`field ${errores[name] ? 'error' : ''}`}>
      <label>{label}</label>
      <input name={name} type={type} value={form[name]} onChange={cambiar} />
      {errores[name] && <span className="msg">{errores[name]}</span>}
    </div>
  );

  return (
    <>
      <h1>Viajes</h1>
      {msg.texto && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

      <form className="card" onSubmit={guardar} noValidate>
        <h2>{editId ? 'Modificar viaje' : 'Registrar viaje'}</h2>
        <div className="form-grid">
          <div className={`field ${errores.vehiculo_id ? 'error' : ''}`}>
            <label>Vehículo</label>
            <select name="vehiculo_id" value={form.vehiculo_id} onChange={cambiar}>
              <option value="">-- Seleccionar --</option>
              {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</option>)}
            </select>
            {errores.vehiculo_id && <span className="msg">{errores.vehiculo_id}</span>}
          </div>
          <div className={`field ${errores.conductor_id ? 'error' : ''}`}>
            <label>Conductor</label>
            <select name="conductor_id" value={form.conductor_id} onChange={cambiar}>
              <option value="">-- Seleccionar --</option>
              {conductores.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
            {errores.conductor_id && <span className="msg">{errores.conductor_id}</span>}
          </div>
          {input('fecha_salida', 'Fecha de salida', 'datetime-local')}
          {input('fecha_llegada', 'Fecha de llegada', 'datetime-local')}
          {input('origen', 'Origen')}
          {input('destino', 'Destino')}
          {input('kilometros', 'Kilómetros', 'number')}
          <div className="field full">
            <label>Observaciones</label>
            <textarea name="observaciones" rows="2" value={form.observaciones} onChange={cambiar} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" type="submit">{editId ? 'Guardar cambios' : 'Registrar'}</button>
          {editId && <button type="button" className="btn btn-gray" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <div className="card">
        <h2>Historial de viajes</h2>
        <div className="toolbar">
          <div className="field">
            <label>Filtrar por vehículo</label>
            <select value={filtro.vehiculo_id} onChange={(e) => setFiltro({ ...filtro, vehiculo_id: e.target.value })}>
              <option value="">Todos</option>
              {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Filtrar por conductor</label>
            <select value={filtro.conductor_id} onChange={(e) => setFiltro({ ...filtro, conductor_id: e.target.value })}>
              <option value="">Todos</option>
              {conductores.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>
        </div>
        <div className="total">Total de kilómetros recorridos: {totalKm.toLocaleString('es-AR')} km</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Salida</th><th>Llegada</th><th>Vehículo</th><th>Conductor</th><th>Ruta</th><th>Km</th><th>Obs.</th><th>Acciones</th></tr></thead>
            <tbody>
              {viajes.length === 0 && <tr><td colSpan="8" className="empty">Sin viajes</td></tr>}
              {viajes.map((v) => (
                <tr key={v.id}>
                  <td>{fmt(v.fecha_salida)}</td><td>{fmt(v.fecha_llegada)}</td>
                  <td>{v.vehiculo}</td><td>{v.conductor}</td>
                  <td>{v.origen} → {v.destino}</td><td>{v.kilometros}</td><td>{v.observaciones}</td>
                  <td className="row-actions">
                    <button className="btn btn-sm" onClick={() => editar(v)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(v.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
