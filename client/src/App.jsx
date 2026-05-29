import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Database, Users, Shield, UserCheck, DollarSign, Calendar,
    BookOpen, Tag, Layers, List, ArrowLeftRight, Clock, Percent,
    FileText, AlignLeft, Receipt, ScrollText, RefreshCw,
    BarChart2, BookMarked, TrendingUp, PieChart, ChevronRight,
    Scale, LogOut, User, Lock, Waves
} from 'lucide-react';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AccesoDenegado from './components/AccesoDenegado';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

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
import CON_REPROCESO_PERIODO from './pages/CON_REPROCESO_PERIODO';
import BalanceGeneralReporte from './pages/BalanceGeneralReporte';
import BalanzaComprobacionReporte from './pages/BalanzaComprobacionReporte';
import LibroIVAReporte from './pages/LibroIVAReporte';
import FlujoEfectivoReporte from './pages/FlujoEfectivoReporte';
import CierreAnualPage from './pages/CierreAnualPage';
// Items con soloAdmin=true solo aparecen para ADMINISTRADOR
const MENU_ITEMS_CONFIG = [
    { path: '/con-usuario', label: 'Usuario', icon: Users, tip: 'Gestión de usuarios del sistema', soloAdmin: true },
    { path: '/con-rol', label: 'Rol', icon: Shield, tip: 'Roles de acceso y permisos', soloAdmin: true },
    { path: '/con-usuario-rol', label: 'Rol Usuario', icon: UserCheck, tip: 'Asignación de roles a usuarios', soloAdmin: true },
    { path: '/con-moneda', label: 'Moneda', icon: DollarSign, tip: 'Monedas registradas (GTQ, USD...)' },
    { path: '/con-estado-periodo', label: 'Estado Periodo', icon: Calendar, tip: 'Estados de un período contable' },
    { path: '/con-estado-asiento', label: 'Estado Asiento', icon: BookOpen, tip: 'Estados de asiento (Borrador, Validado...)' },
    { path: '/con-tipo-asiento', label: 'Tipo Asiento', icon: Tag, tip: 'Tipos de asiento contable' },
    { path: '/con-tipo-cuenta', label: 'Tipo Cuenta', icon: Layers, tip: 'Clasificación de cuentas' },
    { path: '/con-centro-costo', label: 'Centro Costo', icon: List, tip: 'Departamentos de la empresa' },
    { path: '/con-cuenta', label: 'Cuenta', icon: BookMarked, tip: 'Plan de cuentas contable' },
    { path: '/con-tipo-cambio', label: 'Tipo Cambio', icon: ArrowLeftRight, tip: 'Tasas de cambio por fecha' },
    { path: '/con-impuesto', label: 'Impuesto', icon: Percent, tip: 'Impuestos aplicables (IVA, ISR...)' },
    { path: '/con-asiento', label: 'Asiento', icon: FileText, tip: 'Registro de asientos contables' },
    { path: '/con-bitacora', label: 'Bitácora', icon: ScrollText, tip: 'Registro de auditoría del sistema', soloAdmin: true },
];

const OPERACION_ITEMS = [
    { path: '/gestion-periodos', label: 'Gestión Periodos', icon: Clock, tip: 'Abrir, cerrar períodos contables' },
    { path: '/con-reproceso-periodo', label: 'Reproceso Período', icon: RefreshCw, tip: 'Reabrir un período cerrado' },
    { path: '/cierre-anual', label: 'Cierre Anual', icon: Lock, tip: 'Asiento de cierre del ejercicio contable' }, // ← NUEVO
];

const REPORTE_ITEMS = [
    { path: '/reporte-libro-diario', label: 'Libro Diario', icon: BarChart2, tip: 'Listado cronológico de partidas' },
    { path: '/reporte-libro-mayor', label: 'Libro Mayor', icon: BookOpen, tip: 'Movimientos por cuenta contable' },
    { path: '/reporte-balanza-comprobacion', label: 'Balanza Comprobación', icon: Scale, tip: 'Verificación de cuadre Debe = Haber' },
    { path: '/reporte-estado-resultados', label: 'Estado Resultados', icon: TrendingUp, tip: 'Ingresos vs Gastos — Utilidad o Pérdida' },
    { path: '/reporte-balance-general', label: 'Balance General', icon: PieChart, tip: 'Activo = Pasivo + Capital' },
    { path: '/reporte-libro-iva', label: 'Libro IVA', icon: Receipt, tip: 'Compras y Ventas — Decreto 27-92 Guatemala' }, // ← NUEVO
    { path: '/reporte-flujo-efectivo', label: 'Flujo de Efectivo', icon: Waves, tip: 'Movimientos de Caja y Bancos por actividad' }, // ← NUEVO
];

const NavItem = ({ path, label, icon: Icon, tip, hoverBg, hoverText }) => {
    const location = useLocation();
    const isActive = location.pathname === path;
    return (
        <li>
            <Link to={path} title={tip}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-all duration-200 hover:translate-x-1
                    ${isActive ? `${hoverBg} ${hoverText} font-semibold` : `text-slate-400 hover:${hoverBg} hover:${hoverText}`}`}
            >
                <Icon size={15} className="shrink-0 opacity-80 group-hover:opacity-100" />
                <span className="truncate">{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto shrink-0" />}
            </Link>
        </li>
    );
};

const AppLayout = ({ children }) => {
    const { usuario, logout, esAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // Filtrar items según rol
    const menuItems = MENU_ITEMS_CONFIG.filter(item => !item.soloAdmin || esAdmin());

    return (
        <div className="flex font-[Inter,sans-serif] min-h-screen">
            <nav className="w-64 bg-slate-900 min-h-screen p-4 flex flex-col shadow-xl border-r border-slate-800 print:hidden">
                <div className="flex items-center gap-3 mb-5 px-2 py-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg">
                        <Database size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-none">Sistema</h2>
                        <p className="text-[10px] text-slate-400 leading-none mt-0.5">Contabilidad v1.0</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-3" />

                <ul className="list-none p-0 m-0 flex flex-col gap-0.5 overflow-y-auto flex-1">
                    <li>
                        <Link to="/" className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 text-sm no-underline hover:bg-slate-800 hover:text-white transition-all duration-200">
                            <Home size={15} className="shrink-0" />
                            <span>Inicio</span>
                        </Link>
                    </li>

                    <li className="mt-3 mb-1 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Catálogos y Tablas</span>
                    </li>
                    {menuItems.map(item => (
                        <NavItem key={item.path} {...item} hoverBg="bg-sky-400/10" hoverText="text-sky-300" />
                    ))}

                    <li className="mt-3 mb-1 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operaciones</span>
                    </li>
                    {OPERACION_ITEMS.map(item => (
                        <NavItem key={item.path} {...item} hoverBg="bg-amber-400/10" hoverText="text-amber-300" />
                    ))}

                    <li className="mt-3 mb-1 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reportes</span>
                    </li>
                    {REPORTE_ITEMS.map(item => (
                        <NavItem key={item.path} {...item} hoverBg="bg-emerald-400/10" hoverText="text-emerald-300" />
                    ))}
                </ul>

                <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center">
                            <User size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-300 truncate">{usuario?.nombre}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                                {usuario?.roles?.join(', ') || 'Sin rol'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-xs">
                        <LogOut size={13} />
                        Cerrar sesión
                    </button>
                    <p className="text-[10px] text-slate-600 text-center mt-2 px-2">Análisis de Sistemas I — 2026</p>
                </div>
            </nav>

            <main className="flex-1 p-8 bg-slate-50 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AppRoutes />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

// Rutas separadas para poder usar useAuth dentro de ProtectedRoute
function AppRoutes() {
    const { esAdmin } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Solo ADMINISTRADOR */}
            <Route path="/con-usuario" element={esAdmin() ? <CON_USUARIOCrud /> : <AccesoDenegado />} />
            <Route path="/con-rol" element={esAdmin() ? <CON_ROLCrud /> : <AccesoDenegado />} />
            <Route path="/con-usuario-rol" element={esAdmin() ? <CON_USUARIO_ROLCrud /> : <AccesoDenegado />} />
            <Route path="/con-bitacora" element={esAdmin() ? <CON_BITACORACrud /> : <AccesoDenegado />} />

            {/* Todos los roles */}
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
            <Route path="/con-reproceso-periodo" element={<CON_REPROCESO_PERIODO />} />
            <Route path="/reporte-libro-diario" element={<LibroDiarioReporte />} />
            <Route path="/reporte-libro-mayor" element={<LibroMayorReporte />} />
            <Route path="/reporte-balanza-comprobacion" element={<BalanzaComprobacionReporte />} />
            <Route path="/reporte-estado-resultados" element={<EstadoResultadosReporte />} />
            <Route path="/gestion-periodos" element={<GestionPeriodos />} />
            <Route path="/reporte-balance-general" element={<BalanceGeneralReporte />} />
            <Route path="/reporte-libro-iva" element={<LibroIVAReporte />} />
            <Route path="/reporte-flujo-efectivo" element={<FlujoEfectivoReporte />} />
            <Route path="/cierre-anual" element={<CierreAnualPage />} />
        </Routes>
    );
}

export default App;