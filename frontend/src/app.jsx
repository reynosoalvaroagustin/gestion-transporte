import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import ProtectedRoute from './components/protectedroute';
import Home from './pages/Home';
import Login from './pages/Login';
import Vehiculos from './pages/Vehiculos';
import Conductores from './pages/Conductores';
import Viajes from './pages/Viajes';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehiculos" element={<ProtectedRoute><Vehiculos /></ProtectedRoute>} />
          <Route path="/conductores" element={<ProtectedRoute><Conductores /></ProtectedRoute>} />
          <Route path="/viajes" element={<ProtectedRoute><Viajes /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}