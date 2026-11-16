import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [apiError, setApiError] = useState('');

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const e = {};
    if (modoRegistro && !form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Formato de email inválido';
    if (!form.contrasena) e.contrasena = 'La contraseña es obligatoria';
    else if (modoRegistro && form.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres';
    return e;
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    setApiError('');
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    try {
      if (modoRegistro) await register(form.nombre.trim(), form.email.trim(), form.contrasena);
      else await login(form.email.trim(), form.contrasena);
      navigate('/vehiculos');
    } catch (err) {
      setApiError(err.message);
    }
  };

  const campo = (name, label, type = 'text') => (
    <div className={`field ${errores[name] ? 'error' : ''}`}>
      <label>{label}</label>
      <input name={name} type={type} value={form[name]} onChange={cambiar} />
      {errores[name] && <span className="msg">{errores[name]}</span>}
    </div>
  );

  return (
    <div className="card auth-box">
      <h2>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}
      <form onSubmit={enviar} noValidate>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          {modoRegistro && campo('nombre', 'Nombre')}
          {campo('email', 'Email', 'email')}
          {campo('contrasena', 'Contraseña', 'password')}
        </div>
        <div className="actions">
          <button className="btn" type="submit">{modoRegistro ? 'Registrarme' : 'Entrar'}</button>
        </div>
      </form>
      <p className="switch">
        {modoRegistro ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
        <button type="button" onClick={() => { setModoRegistro(!modoRegistro); setErrores({}); setApiError(''); }}>
          {modoRegistro ? 'Iniciá sesión' : 'Registrate'}
        </button>
      </p>
    </div>
  );
}