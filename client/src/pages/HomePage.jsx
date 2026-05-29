import { Link } from 'react-router-dom';

const cards = [
    {
        icon: '📒',
        titulo: 'Catálogos',
        desc: 'Gestiona usuarios, roles, monedas, tipos de cuenta y demás catálogos base del sistema.',
        links: [
            { to: '/con-usuario',    label: 'Usuarios' },
            { to: '/con-cuenta',     label: 'Plan de Cuentas' },
            { to: '/con-moneda',     label: 'Monedas' },
        ],
        color: '#0ea5e9', bg: '#eff6ff', border: '#bae6fd',
    },
    {
        icon: '📝',
        titulo: 'Contabilidad',
        desc: 'Registra y consulta asientos contables, detalles de partidas y movimientos de impuestos.',
        links: [
            { to: '/con-asiento',        label: 'Asientos' },
            { to: '/con-asiento-detalle', label: 'Detalle de Asiento' },
            { to: '/con-impuesto',       label: 'Impuestos' },
        ],
        color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
    },
    {
        icon: '⚙️',
        titulo: 'Operaciones',
        desc: 'Abre, cierra y reprocesa períodos contables. Gestiona el ciclo completo del ejercicio fiscal.',
        links: [
            { to: '/gestion-periodos',      label: 'Gestión de Períodos' },
            { to: '/con-reproceso-periodo', label: 'Reproceso de Período' },
        ],
        color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
    },
    {
        icon: '📊',
        titulo: 'Reportes',
        desc: 'Genera reportes financieros: Libro Diario, Libro Mayor, Estado de Resultados y Balance General.',
        links: [
            { to: '/reporte-libro-diario',     label: 'Libro Diario' },
            { to: '/reporte-libro-mayor',      label: 'Libro Mayor' },
            { to: '/reporte-balance-general',  label: 'Balance General' },
            { to: '/reporte-estado-resultados',label: 'Estado de Resultados' },
        ],
        color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0',
    },
];

const pasos = [
    { num: '1', titulo: 'Configura catálogos', desc: 'Crea monedas, tipos de cuenta, centros de costo y el plan de cuentas.' },
    { num: '2', titulo: 'Abre un período',     desc: 'En Gestión de Períodos abre el mes que vas a trabajar.' },
    { num: '3', titulo: 'Registra asientos',   desc: 'Ingresa tus partidas contables con sus detalles en Debe y Haber.' },
    { num: '4', titulo: 'Valida y reportea',   desc: 'Valida los asientos y genera tus reportes financieros.' },
];

const HomePage = () => (
    <div className="max-w-5xl">

        {/* ── Hero ── */}
        <div className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl">
            <div className="flex items-start gap-5">
                <div className="text-5xl select-none">🏦</div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
                        Sistema de Contabilidad
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                        Plataforma contable diseñada para la gestión completa del ciclo financiero de una empresa.
                        Permite registrar operaciones, controlar períodos fiscales y generar reportes
                        financieros profesionales como el Libro Diario, Mayor y Balance General.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            👤 Para contadores y administradores financieros
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🔒 Acceso con usuario y rol asignado
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            📋 Bitácora de auditoría automática
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* ── Flujo de trabajo ── */}
        <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-700 mb-4">¿Cómo usar el sistema?</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {pasos.map((p) => (
                    <div key={p.num} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white text-sm font-bold flex items-center justify-center mb-3">
                            {p.num}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">{p.titulo}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* ── Cards de acceso rápido ── */}
        <h2 className="text-lg font-bold text-slate-700 mb-4">Acceso rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {cards.map((card) => (
                <div
                    key={card.titulo}
                    className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ borderColor: card.border }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{card.icon}</span>
                        <h3 className="text-base font-bold" style={{ color: card.color }}>{card.titulo}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{card.desc}</p>
                    <div className="flex flex-wrap gap-2">
                        {card.links.map((l) => (
                            <Link
                                key={l.to}
                                to={l.to}
                                className="px-3 py-1 rounded-lg text-xs font-medium no-underline transition-all duration-200 hover:scale-105"
                                style={{ background: card.bg, color: card.color, border: `1px solid ${card.border}` }}
                            >
                                {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* ── Nota informativa ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-xl">💡</span>
            <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Tip del sistema</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                    Pasa el cursor sobre cualquier campo del formulario para ver una descripción de qué dato ingresar.
                    Los reportes financieros solo muestran asientos en estado <strong>VALIDADO</strong>.
                    Asegúrate de validar tus partidas antes de generar reportes.
                </p>
            </div>
        </div>
    </div>
);

export default HomePage;