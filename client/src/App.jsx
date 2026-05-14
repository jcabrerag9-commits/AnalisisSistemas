import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Database } from 'lucide-react';
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
import LibroDiarioReporte from './pages/LibroDiarioReporte';
import LibroMayorReporte from './pages/LibroMayorReporte';
import GestionPeriodos from './pages/GestionPeriodos';
import EstadoResultadosReporte from './pages/EstadoResultadosReporte';

// ← NUEVA IMPORTACIÓN
import CON_REPROCESO_PERIODO from './pages/CON_REPROCESO_PERIODO';
// ← NUEVA IMPORTACIÓN
import BalanceGeneralReporte from './pages/BalanceGeneralReporte';

const menuItems = [
  { path: '/con-usuario', label: 'Usuario' },
  { path: '/con-rol', label: 'Rol' },
  { path: '/con-usuario-rol', label: 'Rol Usuario' },
  { path: '/con-moneda', label: 'Moneda' },
  { path: '/con-estado-periodo', label: 'Estado Periodo' },
  { path: '/con-estado-asiento', label: 'Estado Asiento' },
  { path: '/con-tipo-asiento', label: 'Tipo Asiento' },
  { path: '/con-tipo-cuenta', label: 'Tipo Cuenta' },
  { path: '/con-centro-costo', label: 'Centro Costo' },
  { path: '/con-cuenta', label: 'Cuenta' },
  { path: '/con-tipo-cambio', label: 'Tipo Cambio' },
  { path: '/con-impuesto', label: 'Impuesto' },
  { path: '/con-asiento', label: 'Asiento' },
  { path: '/con-bitacora', label: 'Bitácora' },
];

const operacionItems = [
  { path: '/gestion-periodos', label: 'Gestión Periodos' },
  { path: '/con-reproceso-periodo', label: 'Reproceso Período' },
];

const reporteItems = [
  { path: '/reporte-libro-diario', label: 'Libro Diario' },
  { path: '/reporte-libro-mayor', label: 'Libro Mayor' },
  { path: '/reporte-estado-resultados', label: 'Estado de Resultados' },
  { path: '/reporte-balance-general', label: 'Balance General' },
];





function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-50">
        <nav className="w-64 bg-white border-r border-zinc-200 fixed left-0 top-0 h-screen overflow-y-auto flex flex-col z-40 print:hidden">
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center gap-2 flex-shrink-0">
            <Database size={26} className="text-zinc-700" />
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Menú CRUD</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="list-none p-0 m-0 flex flex-col">
              <li>
                <Link to="/" className="flex items-center gap-2 px-4 py-2 mx-2 rounded text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                  <Home size={18} />
                  <span>Inicio</span>
                </Link>
              </li>

              <li className="px-6 pt-4 pb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Tablas</span>
              </li>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="flex items-center gap-2 px-4 py-2 mx-2 rounded text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}

              <li className="px-6 pt-4 pb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Operaciones</span>
              </li>
              {operacionItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="flex items-center gap-2 px-4 py-2 mx-2 rounded text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}


              <li className="px-6 pt-4 pb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Reportes</span>
              </li>
              {reporteItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="flex items-center gap-2 px-4 py-2 mx-2 rounded text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-4 border-t border-zinc-200 flex-shrink-0">
            <p className="text-xs text-zinc-400 text-center">Sistema Contable v1.0</p>
          </div>
        </nav>

        <main className="ml-64 flex-1 min-h-screen bg-zinc-50 p-8 print:p-0 print:ml-0 print:bg-white print:overflow-visible">
          <Routes>
            <Route path="/" element={
              <div className="max-w-2xl">
                <h1 className="text-3xl font-extrabold text-zinc-700 mb-3">Bienvenido al Sistema de Contabilidad</h1>
                <p className="text-zinc-500 text-base leading-relaxed">Seleccione una tabla del menú lateral para gestionar los registros.</p>
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
            <Route path="/con-impuesto" element={<CON_IMPUESTOCrud />} />
            <Route path="/con-asiento" element={<CON_ASIENTOCrud />} />
            <Route path="/con-asiento-detalle" element={<CON_ASIENTO_DETALLECrud />} />
            <Route path="/con-impuesto-movimiento" element={<CON_IMPUESTO_MOVIMIENTOCrud />} />
            <Route path="/con-bitacora" element={<CON_BITACORACrud />} />
            <Route path="/con-reproceso-periodo" element={<CON_REPROCESO_PERIODO />} />
            <Route path="/reporte-libro-diario" element={<LibroDiarioReporte />} />
            <Route path="/reporte-libro-mayor" element={<LibroMayorReporte />} />
            <Route path="/reporte-estado-resultados" element={<EstadoResultadosReporte />} />
            <Route path="/gestion-periodos" element={<GestionPeriodos />} />
            {/* ← NUEVA RUTA */}
            <Route path="/reporte-balance-general" element={<BalanceGeneralReporte />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;