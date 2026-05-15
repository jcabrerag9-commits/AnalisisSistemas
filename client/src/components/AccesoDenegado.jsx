import { Link } from 'react-router-dom';

const AccesoDenegado = () => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', textAlign: 'center',
    }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 8px' }}>
            Acceso Denegado
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
            No tienes permisos para ver esta sección.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '28px' }}>
            Contacta al administrador del sistema si crees que esto es un error.
        </p>
        <Link to="/" style={{
            background: '#0ea5e9', color: 'white',
            padding: '10px 24px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '600', fontSize: '14px',
        }}>
            Volver al inicio →
        </Link>
    </div>
);

export default AccesoDenegado;