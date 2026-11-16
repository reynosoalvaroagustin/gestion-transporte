import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">🚚 Transporte</NavLink>
      <div className="links">
        <NavLink to="/">Inicio</NavLink>
        {user ? (
          <>
            <NavLink to="/vehiculos">Vehículos</NavLink>
            <NavLink to="/conductores">Conductores</NavLink>
            <NavLink to="/viajes">Viajes</NavLink>
            <span className="user">Hola, {user.nombre}</span>
            <button className="btn btn-sm btn-outline" onClick={salir}>Salir</button>
          </>
        ) : (
          <NavLink to="/login">Iniciar sesión</NavLink>
        )}
      </div>
    </nav>
  );
}