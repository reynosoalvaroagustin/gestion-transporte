import { useEffect, useState } from 'react';
import { api } from '../services/api';

const vacio = { nombre: '', apellido: '', numero_documento: '', numero_licencia: '', fecha_alta_licencia: '', fecha_vencimiento_licencia: '' };

export default function Conductores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [buscar, setBuscar] = useState('');

  const cargar = async () => {
    try { setLista(await api(`/conductores?buscar=${encodeURIComponent(buscar)}`)); }
    catch (e) { setMsg({ tipo: 'error', texto: e.message }); }
  };
  useEffect(() => { cargar(); }, [buscar]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Obligatorio';
    if (!form.apellido.trim()) e.apellido = 'Obligatorio';
    if (!/^\d{6,12}$/.test(form.numero_documento)) e.numero_documento = '6 a 12 dígitos';
    if (!form.numero_licencia.trim()) e.numero_licencia = 'Obligatorio';
    if (!form.fecha_alta_licencia) e.fecha_alta_licencia = 'Obligatorio';
    if (!form.fecha_vencimiento_licencia) e.fecha_vencimiento_licencia = 'Obligatorio';
    else if (form.fecha_alta_licencia && form.fecha_vencimiento_licencia <= form.fecha_alta_licencia)
      e.fecha_vencimiento_licencia = 'Debe ser posterior al alta';
    return e;
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    try {
      await api(editId ? `/conductores/${editId}` : '/conductores', { method: editId ? 'PUT' : 'POST', body: form });
      setMsg({ tipo: 'ok', texto: editId ? 'Conductor actualizado' : 'Conductor creado' });
      cancelar();
      cargar();
    } catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const editar = (c) => {
    setEditId(c.id);
    setForm({
      nombre: c.nombre, apellido: c.apellido, numero_documento: c.numero_documento, numero_licencia: c.numero_licencia,
      fecha_alta_licencia: c.fecha_alta_licencia.slice(0, 10), fecha_vencimiento_licencia: c.fecha_vencimiento_licencia.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => { setEditId(null); setForm(vacio); setErrores({}); };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este conductor?')) return;
    try { await api(`/conductores/${id}`, { method: 'DELETE' }); setMsg({ tipo: 'ok', texto: 'Conductor eliminado' }); cargar(); }
    catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const hoy = new Date().toISOString().slice(0, 10);

  const campo = (name, label, type = 'text') => (
    <div className={`field ${errores[name] ? 'error' : ''}`}>
      <label>{label}</label>
      <input name={name} type={type} value={form[name]} onChange={cambiar} />
      {errores[name] && <span className="msg">{errores[name]}</span>}
    </div>
  );

  return (
    <>
      <h1>Conductores</h1>
      {msg.texto && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

      <form className="card" onSubmit={guardar} noValidate>
        <h2>{editId ? 'Modificar conductor' : 'Nuevo conductor'}</h2>
        <div className="form-grid">
          {campo('nombre', 'Nombre')}
          {campo('apellido', 'Apellido')}
          {campo('numero_documento', 'N° de documento')}
          {campo('numero_licencia', 'N° de licencia')}
          {campo('fecha_alta_licencia', 'Alta de licencia', 'date')}
          {campo('fecha_vencimiento_licencia', 'Vencimiento de licencia', 'date')}
        </div>
        <div className="actions">
          <button className="btn" type="submit">{editId ? 'Guardar cambios' : 'Agregar'}</button>
          {editId && <button type="button" className="btn btn-gray" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Buscar</label>
            <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Nombre, apellido o documento" />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Documento</th><th>Licencia</th><th>Alta</th><th>Vencimiento</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan="6" className="empty">Sin conductores</td></tr>}
              {lista.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre} {c.apellido}</td><td>{c.numero_documento}</td><td>{c.numero_licencia}</td>
                  <td>{c.fecha_alta_licencia}</td>
                  <td className={c.fecha_vencimiento_licencia < hoy ? 'badge-warn' : ''}>
                    {c.fecha_vencimiento_licencia}{c.fecha_vencimiento_licencia < hoy && ' (vencida)'}
                  </td>
                  <td className="row-actions">
                    <button className="btn btn-sm" onClick={() => editar(c)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(c.id)}>Eliminar</button>
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
