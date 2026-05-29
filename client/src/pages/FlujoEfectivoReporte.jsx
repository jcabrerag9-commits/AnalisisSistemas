import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const MESES = [
    { value: '1', label: 'Enero' },  { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },  { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },   { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },  { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const CATEGORIAS = {
    OPERACION:      { label: 'Actividades de Operación',       color: 'bg-sky-50 border-sky-200',      badge: 'bg-sky-100 text-sky-700' },
    INVERSION:      { label: 'Actividades de Inversión',       color: 'bg-amber-50 border-amber-200',  badge: 'bg-amber-100 text-amber-700' },
    FINANCIAMIENTO: { label: 'Actividades de Financiamiento',  color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700' },
};

const FlujoEfectivoReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [filtroModo, setFiltroModo] = useState('periodo'); // 'periodo' o 'fecha'
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [monedaId, setMonedaId] = useState('');
    const [estadoAsientoId, setEstadoAsientoId] = useState('');

    // Catalogos
    const [anios, setAnios]         = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [estadosAsiento, setEstadosAsiento] = useState([]);

    const [data, setData]           = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resAnios, resMon, resEst] = await Promise.all([
                    axios.get('http://localhost:5000/api/reportes/libro-diario/anios'),
                    axios.get('http://localhost:5000/api/con-moneda'),
                    axios.get('http://localhost:5000/api/con-estado-asiento'),
                ]);
                setAnios(resAnios.data);
                setMonedas(resMon.data);
                setEstadosAsiento(resEst.data);
            } catch (err) {
                console.error('Error al obtener catálogos:', err);
            }
        };
        fetchInitialData();
    }, []);

    const handleGenerar = async () => {
        if (filtroModo === 'periodo' && !anio) { setError('Debe seleccionar un año.'); return; }
        if (filtroModo === 'fecha' && (!fechaInicio || !fechaFin)) { setError('Debe ingresar un rango de fechas.'); return; }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const params = {};
            if (filtroModo === 'periodo') {
                params.anio = anio;
                if (mes) params.mes = mes;
            } else {
                params.fechaInicio = fechaInicio;
                params.fechaFin = fechaFin;
            }

            if (monedaId) params.monedaId = monedaId;
            if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

            const res = await axios.get(
                'http://localhost:5000/api/reportes/flujo-efectivo',
                { params }
            );
            setData(res.data);
        } catch (err) {
            setError(`Error al consultar: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fmt = (n) =>
        'Q ' + (parseFloat(n) || 0).toLocaleString('en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const labelPeriodo = filtroModo === 'periodo'
        ? (mes ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}` : `Año ${anio}`)
        : `Del ${fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-GT') : ''} al ${fechaFin ? new Date(fechaFin).toLocaleDateString('es-GT') : ''}`;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 print:shadow-none print:rounded-none">

            <div className="px-8 pt-8 pb-4 border-b border-slate-100 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center md:text-left">
                        Estado de Flujo de Efectivo
                    </h2>
                    {/* Botonera de Modo */}
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 self-start">
                        <button
                            type="button"
                            onClick={() => { setFiltroModo('periodo'); setFechaInicio(''); setFechaFin(''); }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filtroModo === 'periodo' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Por Período
                        </button>
                        <button
                            type="button"
                            onClick={() => { setFiltroModo('fecha'); setAnio(''); setMes(''); }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filtroModo === 'fecha' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Por Rango de Fechas
                        </button>
                    </div>
                </div>
                <p className="text-center md:text-left text-sm text-slate-500 mt-1">
                    Movimientos en cuentas de Caja y Bancos clasificados por actividad — NIIF para PYMES
                </p>
            </div>

            <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Filtros de consulta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filtroModo === 'periodo' ? (
                        <>
                            <Select label="Año *" value={anio} onChange={e => setAnio(e.target.value)} options={anios} />
                            <Select label="Mes (opcional — acumulado)" value={mes}  onChange={e => setMes(e.target.value)}  options={MESES} />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-sky-500 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Fecha Fin</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-sky-500 bg-white"
                                />
                            </div>
                        </>
                    )}
                    <Select
                        label="Moneda"
                        value={monedaId}
                        onChange={(e) => setMonedaId(e.target.value)}
                        options={[
                            { value: '', label: 'Todas las monedas' },
                            ...monedas.map(m => ({ value: String(m.MON_MONEDA), label: `${m.MON_CODIGO_ISO} - ${m.MON_NOMBRE}` }))
                        ]}
                    />
                </div>

                {/* Filtros Avanzados (Colapsable) */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 outline-none"
                    >
                        {mostrarAvanzados ? '▲ Ocultar filtros avanzados' : '▼ Mostrar filtros avanzados'}
                    </button>

                    {mostrarAvanzados && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <Select
                                label="Estado del Asiento"
                                value={estadoAsientoId}
                                onChange={(e) => setEstadoAsientoId(e.target.value)}
                                options={[
                                    { value: '', label: 'Solo Validados (Default)' },
                                    { value: 'TODOS', label: 'Todos (Borrador y Validado)' },
                                    ...estadosAsiento.map(e => ({ value: String(e.ESA_ESTADO_ASIENTO), label: e.ESA_NOMBRE }))
                                ]}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-150 pt-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar'}
                    </Button>
                    {data && <Button variant="secondary" onClick={() => window.print()}>Imprimir / PDF</Button>}
                </div>
            </div>

            {error && (
                <div className="mx-8 mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 print:hidden">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center py-12 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {data && (
                <div className="px-8 pb-8 print:px-4 print:pb-4 max-w-4xl mx-auto">

                    {/* Encabezado impresión */}
                    <div className="hidden print:block text-center mb-8">
                        <h2 className="text-xl font-bold">Estado de Flujo de Efectivo</h2>
                        <p className="text-sm text-slate-600">Período: {labelPeriodo}</p>
                        <p className="text-xs italic text-slate-500">(Método Directo — NIIF para PYMES)</p>
                    </div>

                    {/* Secciones por categoría */}
                    {Object.entries(CATEGORIAS).map(([cat, cfg]) => {
                        const filas = data[cat.toLowerCase()] || [];
                        const neto  = filas.reduce((s, r) =>
                            s + (parseFloat(r.ENTRADA) || 0) - (parseFloat(r.SALIDA) || 0), 0);

                        return (
                            <div key={cat} className={`mb-6 rounded-lg border ${cfg.color} p-5`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{cfg.label}</h3>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                                        {filas.length} movimiento{filas.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {filas.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">Sin movimientos en este período.</p>
                                ) : (
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="text-xs text-slate-500 border-b border-slate-300">
                                                <th className="text-left pb-2 font-medium">Fecha</th>
                                                <th className="text-left pb-2 font-medium">Descripción</th>
                                                <th className="text-right pb-2 font-medium text-emerald-700">Entradas</th>
                                                <th className="text-right pb-2 font-medium text-red-700">Salidas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filas.map((r, i) => (
                                                <tr key={i} className="border-b border-slate-200/60">
                                                    <td className="py-1.5 pr-4 text-slate-500 text-xs whitespace-nowrap">
                                                        {r.FECHA ? new Date(r.FECHA).toLocaleDateString('es-GT') : ''}
                                                    </td>
                                                    <td className="py-1.5 pr-4 text-slate-700">{r.DESCRIPCION}</td>
                                                    <td className="py-1.5 text-right font-mono text-emerald-700">
                                                        {parseFloat(r.ENTRADA) > 0 ? fmt(r.ENTRADA) : ''}
                                                    </td>
                                                    <td className="py-1.5 text-right font-mono text-red-600">
                                                        {parseFloat(r.SALIDA) > 0 ? fmt(r.SALIDA) : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-slate-400 font-semibold">
                                                <td colSpan={2} className="pt-2 text-slate-700 text-sm">
                                                    Flujo neto — {cfg.label}
                                                </td>
                                                <td colSpan={2} className={`pt-2 text-right font-mono font-bold ${neto >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {fmt(neto)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                        );
                    })}

                    {/* Flujo neto total */}
                    <div className={`mt-4 p-5 rounded-lg flex justify-between items-center border-2 ${
                        data.resumen.flujoNeto >= 0
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                            : 'bg-red-50 border-red-400 text-red-900'
                    }`}>
                        <div>
                            <p className="text-lg font-bold uppercase">
                                {data.resumen.flujoNeto >= 0 ? 'Incremento Neto de Efectivo' : 'Disminución Neta de Efectivo'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-70">{labelPeriodo}</p>
                        </div>
                        <span className="text-2xl font-bold font-mono underline decoration-double">
                            {fmt(Math.abs(data.resumen.flujoNeto))}
                        </span>
                    </div>

                    {/* Firmas impresión */}
                    <div className="hidden print:grid print:grid-cols-2 print:gap-20 print:mt-16 print:text-center">
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold text-sm">Contador General</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold text-sm">Representante Legal</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlujoEfectivoReporte;