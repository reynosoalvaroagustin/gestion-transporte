import { useEffect, useState } from 'react';
import { api } from '../services/api';

const vacio = { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' };

export default function Vehiculos() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [buscar, setBuscar] = useState('');

  const cargar = async () => {
    try { setLista(await api(`/vehiculos?buscar=${encodeURIComponent(buscar)}`)); }
    catch (e) { setMsg({ tipo: 'error', texto: e.message }); }
  };
  useEffect(() => { cargar(); }, [buscar]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const e = {};
    const max = new Date().getFullYear() + 1;
    if (!form.marca.trim()) e.marca = 'Obligatorio';
    if (!form.modelo.trim()) e.modelo = 'Obligatorio';
    if (!/^[A-Za-z0-9 -]{6,10}$/.test(form.patente.trim())) e.patente = 'Patente inválida (6 a 10 caracteres)';
    if (!/^\d{4}$/.test(form.anio) || form.anio < 1950 || form.anio > max) e.anio = `Entre 1950 y ${max}`;
    if (!(Number(form.capacidad_carga) > 0)) e.capacidad_carga = 'Debe ser mayor a 0';
    return e;
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    try {
      const body = { ...form, patente: form.patente.trim().toUpperCase(), anio: Number(form.anio), capacidad_carga: Number(form.capacidad_carga) };
      await api(editId ? `/vehiculos/${editId}` : '/vehiculos', { method: editId ? 'PUT' : 'POST', body });
      setMsg({ tipo: 'ok', texto: editId ? 'Vehículo actualizado' : 'Vehículo creado' });
      cancelar();
      cargar();
    } catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const editar = (v) => {
    setEditId(v.id);
    setForm({ marca: v.marca, modelo: v.modelo, patente: v.patente, anio: String(v.anio), capacidad_carga: String(v.capacidad_carga) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => { setEditId(null); setForm(vacio); setErrores({}); };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try { await api(`/vehiculos/${id}`, { method: 'DELETE' }); setMsg({ tipo: 'ok', texto: 'Vehículo eliminado' }); cargar(); }
    catch (err) { setMsg({ tipo: 'error', texto: err.message }); }
  };

  const campo = (name, label, type = 'text') => (
    <div className={`field ${errores[name] ? 'error' : ''}`}>
      <label>{label}</label>
      <input name={name} type={type} value={form[name]} onChange={cambiar} />
      {errores[name] && <span className="msg">{errores[name]}</span>}
    </div>
  );

  return (
    <>
      <h1>Vehículos</h1>
      {msg.texto && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

      <form className="card" onSubmit={guardar} noValidate>
        <h2>{editId ? 'Modificar vehículo' : 'Nuevo vehículo'}</h2>
        <div className="form-grid">
          {campo('marca', 'Marca')}
          {campo('modelo', 'Modelo')}
          {campo('patente', 'Patente')}
          {campo('anio', 'Año', 'number')}
          {campo('capacidad_carga', 'Capacidad de carga (kg)', 'number')}
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
            <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Marca, modelo o patente" />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Marca</th><th>Modelo</th><th>Patente</th><th>Año</th><th>Carga (kg)</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan="6" className="empty">Sin vehículos</td></tr>}
              {lista.map((v) => (
                <tr key={v.id}>
                  <td>{v.marca}</td><td>{v.modelo}</td><td>{v.patente}</td><td>{v.anio}</td><td>{v.capacidad_carga}</td>
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
