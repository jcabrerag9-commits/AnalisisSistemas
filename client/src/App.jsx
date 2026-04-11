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
import GestionPeriodos from './pages/GestionPeriodos';

// ← NUEVA IMPORTACIÓN
import CON_REPROCESO_PERIODO from './pages/CON_REPROCESO_PERIODO';

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
  { path: '/con-asiento-detalle', label: 'Asiento Detalle' },
  { path: '/con-impuesto-movimiento', label: 'Impuesto Movimiento' },
  { path: '/con-bitacora', label: 'Bitácora' },
];

// ← NUEVA SECCIÓN DE OPERACIONES
const operacionesItems = [
  { path: '/con-reproceso-periodo', label: 'Reproceso Período' },
]
const reporteItems = [
  { path: '/reporte-libro-diario', label: 'Libro Diario' },
];

const operacionItems = [
  { path: '/gestion-periodos', label: 'Gestión Periodos' },
];

function App() {
  return (
    <Router>
      <div className="flex font-[Inter,sans-serif] min-h-screen">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-900 min-h-screen p-5 flex flex-col shadow-xl border-r border-slate-800">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <Database size={26} className="text-sky-400 drop-shadow-lg" />
            <h2 className="text-lg font-bold text-white tracking-tight">Menú CRUD</h2>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4" />

          {/* Navigation */}
          <ul className="list-none p-0 m-0 flex flex-col gap-1 overflow-y-auto flex-1">
            {/* Home link */}
            <li>
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 no-underline
                           hover:bg-slate-800 hover:text-white transition-all duration-200 group"
              >
                <Home size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">Inicio</span>
              </Link>
            </li>

            {/* Section label: Tablas */}
            <li className="mt-4 mb-1 px-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Tablas
              </span>
            </li>

            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded-lg text-sm text-sky-400 no-underline
                             hover:bg-sky-400/10 hover:text-sky-300 hover:translate-x-1
                             active:scale-95 transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* ← NUEVA SECCIÓN: Operaciones */}
            <li className="mt-4 mb-1 px-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Operaciones
              </span>
            </li>

            {operacionesItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded-lg text-sm text-amber-400 no-underline
                             hover:bg-amber-400/10 hover:text-amber-300 hover:translate-x-1
                             active:scale-95 transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Operaciones section */}
            <li className="mt-4 mb-1 px-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Operaciones
              </span>
            </li>

            {operacionItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded-lg text-sm text-purple-400 no-underline
                             hover:bg-purple-400/10 hover:text-purple-300 hover:translate-x-1
                             active:scale-95
                             transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Reportes section */}
            <li className="mt-4 mb-1 px-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Reportes
              </span>
            </li>

            {reporteItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded-lg text-sm text-emerald-400 no-underline
                             hover:bg-emerald-400/10 hover:text-emerald-300 hover:translate-x-1
                             active:scale-95
                             transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[11px] text-slate-600 text-center">Sistema Contable v1.0</p>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-10 bg-slate-50 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              <div className="max-w-2xl">
                <h1 className="text-3xl font-extrabold text-slate-700 mb-3">
                  Bienvenido al Sistema de Contabilidad
                </h1>
                <p className="text-slate-500 text-base leading-relaxed">
                  Seleccione una tabla del menú lateral para gestionar los registros.
                </p>
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
            <Route path="/gestion-periodos" element={<GestionPeriodos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
