import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Envuelve rutas que requieren autenticación.
 * Si no hay sesión activa, redirige al login.
 */
const ProtectedRoute = ({ children }) => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: '#0f172a',
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏦</div>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return usuario ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
