import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="card hero">
        <h1>Gestión de flota y viajes</h1>
        <p>Registrá vehículos y conductores, cargá los viajes realizados y consultá el historial y los kilómetros recorridos.</p>
        {user
          ? <Link to="/viajes" className="btn">Ir a viajes</Link>
          : <Link to="/login" className="btn">Iniciar sesión</Link>}
      </section>
      <section className="features">
        <div className="card"><h2>🚛 Vehículos</h2><p>Alta, edición y baja de la flota.</p></div>
        <div className="card"><h2>🧑‍✈️ Conductores</h2><p>Control de licencias y vencimientos.</p></div>
        <div className="card"><h2>🗺️ Viajes</h2><p>Historial y total de kilómetros por vehículo o conductor.</p></div>
      </section>
    </>
  );
}