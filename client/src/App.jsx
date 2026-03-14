
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Home, Database } from 'lucide-react';
import './index.css';

import CON_USUARIOCrud from './pages/CON_USUARIOCrud';
import CON_ROLCrud from './pages/CON_ROLCrud';
import CON_USUARIO_ROLCrud from './pages/CON_USUARIO_ROLCrud';
import CON_MONEDACrud from './pages/CON_MONEDACrud';
import CON_ESTADO_PERIODOCrud from './pages/CON_ESTADO_PERIODOCrud';
import CON_ESTADO_ASIENTOCrud from './pages/CON_ESTADO_ASIENTOCrud';
import CON_TIPO_ASIENTOCrud from './pages/CON_TIPO_ASIENTOCrud';
import CON_TIPO_CUENTACrud from './pages/CON_TIPO_CUENTACrud';
import CON_CENTRO_COSTOCrud from './pages/CON_CENTRO_COSTOCrud';
import CON_CUENTACrud from './pages/CON_CUENTACrud';
import CON_TIPO_CAMBIOCrud from './pages/CON_TIPO_CAMBIOCrud';
import CON_PERIODOCrud from './pages/CON_PERIODOCrud';
import CON_IMPUESTOCrud from './pages/CON_IMPUESTOCrud';
import CON_ASIENTOCrud from './pages/CON_ASIENTOCrud';
import CON_ASIENTO_DETALLECrud from './pages/CON_ASIENTO_DETALLECrud';
import CON_IMPUESTO_MOVIMIENTOCrud from './pages/CON_IMPUESTO_MOVIMIENTOCrud';
import CON_BITACORACrud from './pages/CON_BITACORACrud';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
        <nav style={{ width: '250px', padding: '20px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Database size={24} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Menú CRUD</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '15px 0' }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Home size={18} /> Inicio
              </Link>
            </li>
            <li style={{ margin: '10px 0' }}><Link to="/con-usuario" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Usuario</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-rol" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Rol</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-usuario-rol" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Rol Usuario</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-moneda" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Moneda</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-estado-periodo" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Estado Periodo</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-estado-asiento" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Estado Asiento</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-tipo-asiento" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Tipo Asiento</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-tipo-cuenta" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Tipo Cuenta</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-centro-costo" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Centro Costo</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-cuenta" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Cuenta</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-tipo-cambio" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Tipo Cambio</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-periodo" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Periodo</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-impuesto" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Impuesto</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-asiento" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Asiento</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-asiento-detalle" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Asiento Detalle</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-impuesto-movimiento" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Impuesto Movimiento</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/con-bitacora" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>Bitacora</Link></li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: '40px', background: '#f8fafc' }}>
          <Routes>
            <Route path="/" element={
              <div>
                <h1 style={{ color: '#334155' }}>Bienvenido al Sistema de Contabilidad</h1>
                <p style={{ color: '#64748b' }}>Seleccione una tabla del menú lateral para gestionar los registros.</p>
              </div>
            } />
            <Route path="/con-usuario" element={<CON_USUARIOCrud />} />
            <Route path="/con-rol" element={<CON_ROLCrud />} />
            <Route path="/con-usuario-rol" element={<CON_USUARIO_ROLCrud />} />
            <Route path="/con-moneda" element={<CON_MONEDACrud />} />
            <Route path="/con-estado-periodo" element={<CON_ESTADO_PERIODOCrud />} />
            <Route path="/con-estado-asiento" element={<CON_ESTADO_ASIENTOCrud />} />
            <Route path="/con-tipo-asiento" element={<CON_TIPO_ASIENTOCrud />} />
            <Route path="/con-tipo-cuenta" element={<CON_TIPO_CUENTACrud />} />
            <Route path="/con-centro-costo" element={<CON_CENTRO_COSTOCrud />} />
            <Route path="/con-cuenta" element={<CON_CUENTACrud />} />
            <Route path="/con-tipo-cambio" element={<CON_TIPO_CAMBIOCrud />} />
            <Route path="/con-periodo" element={<CON_PERIODOCrud />} />
            <Route path="/con-impuesto" element={<CON_IMPUESTOCrud />} />
            <Route path="/con-asiento" element={<CON_ASIENTOCrud />} />
            <Route path="/con-asiento-detalle" element={<CON_ASIENTO_DETALLECrud />} />
            <Route path="/con-impuesto-movimiento" element={<CON_IMPUESTO_MOVIMIENTOCrud />} />
            <Route path="/con-bitacora" element={<CON_BITACORACrud />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
