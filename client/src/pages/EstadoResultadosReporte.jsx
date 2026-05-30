import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const MESES = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

// ISR Guatemala: 25% sobre utilidad imponible (Decreto 10-2012)
const ISR_TASA = 0.25;

const EstadoResultadosReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [filtroModo, setFiltroModo] = useState('periodo'); // 'periodo' o 'fecha'
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [centroCostoId, setCentroCostoId] = useState('');
    const [monedaId, setMonedaId] = useState('');
    const [estadoAsientoId, setEstadoAsientoId] = useState('');

    // Catalogos
    const [anios, setAnios]         = useState([]);
    const [centrosCosto, setCentrosCosto] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [estadosAsiento, setEstadosAsiento] = useState([]);

    const [data, setData]           = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resAnios, resCC, resMon, resEst] = await Promise.all([
                    axios.get('http://localhost:5000/api/reportes/libro-diario/anios'),
                    axios.get('http://localhost:5000/api/con-centro-costo'),
                    axios.get('http://localhost:5000/api/con-moneda'),
                    axios.get('http://localhost:5000/api/con-estado-asiento'),
                ]);
                setAnios(resAnios.data);
                setCentrosCosto(resCC.data);
                setMonedas(resMon.data);
                setEstadosAsiento(resEst.data);
            } catch (err) {
                console.error('Error al obtener catálogos:', err);
            }
        };
        fetchInitialData();
    }, []);

    const handleGenerar = async () => {
        if (filtroModo === 'periodo' && (!anio || !mes)) { setError('Debe seleccionar un año y un mes.'); return; }
        if (filtroModo === 'fecha' && (!fechaInicio || !fechaFin)) { setError('Debe ingresar un rango de fechas.'); return; }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const params = {};
            if (filtroModo === 'periodo') {
                params.anio = anio;
                params.mes = mes;
            } else {
                params.fechaInicio = fechaInicio;
                params.fechaFin = fechaFin;
            }

            if (centroCostoId) params.centroCostoId = centroCostoId;
            if (monedaId) params.monedaId = monedaId;
            if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

            const res = await axios.get(
                'http://localhost:5000/api/reportes/estado-resultados',
                { params }
            );
            setData(res.data);
        } catch (err) {
            setError(`Error al consultar el reporte: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fmt = (n) =>
        'Q ' + (parseFloat(n) || 0).toLocaleString('en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Procesar datos ──
    const cuentas   = data?.cuentas   || [];
    const impMovtos = data?.impuestos  || [];

    const ingresos        = cuentas.filter(r => r.TIPO === '4');
    const gastosNormales  = cuentas.filter(r => r.TIPO === '5' && r.ES_DEPRECIACION === 'N');
    const depreciaciones  = cuentas.filter(r => r.TIPO === '5' && r.ES_DEPRECIACION === 'S');

    const totalIngresos      = ingresos.reduce((s, r) => s + (parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)), 0);
    const totalGastos        = gastosNormales.reduce((s, r) => s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);
    const totalDepreciacion  = depreciaciones.reduce((s, r) => s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);

    const ivaGenerado   = impMovtos.filter(r => r.TIPO_AFECTACION === 'GENERADO')
                                   .reduce((s, r) => s + (parseFloat(r.TOTAL_IMPUESTO) || 0), 0);
    const ivaSoportado  = impMovtos.filter(r => r.TIPO_AFECTACION === 'SOPORTADO')
                                   .reduce((s, r) => s + (parseFloat(r.TOTAL_IMPUESTO) || 0), 0);
    const ivaLiquido    = ivaGenerado - ivaSoportado; 

    const utilidadAntesISR = totalIngresos - totalGastos - totalDepreciacion;
    const isr              = utilidadAntesISR > 0 ? utilidadAntesISR * ISR_TASA : 0;
    const utilidadNeta     = utilidadAntesISR - isr;

    const labelMes = filtroModo === 'periodo' ? (MESES.find(m => m.value === mes)?.label || mes) : '';
    const diasMes  = filtroModo === 'periodo' && mes && anio ? new Date(parseInt(anio), parseInt(mes), 0).getDate() : 30;

    const formatFechaStr = (f) => f ? new Date(f).toLocaleDateString('es-HN') : '';

    return (
        <div className="bg-white rounded-xl shadow-md p-8 print:shadow-none print:p-0">

            {/* Filtros */}
            <div className="print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Estado de Resultados</h2>
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

                <div className="mx-0 my-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {filtroModo === 'periodo' ? (
                            <>
                                <Select label="Año" value={anio} onChange={e => setAnio(e.target.value)} options={anios} />
                                <Select label="Mes" value={mes}  onChange={e => setMes(e.target.value)}  options={MESES} />
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
                                    label="Centro de Costo"
                                    value={centroCostoId}
                                    onChange={(e) => setCentroCostoId(e.target.value)}
                                    options={[
                                        { value: '', label: 'Todos los centros' },
                                        ...centrosCosto.map(cc => ({ value: String(cc.CTC_CENTRO_COSTO), label: cc.CTC_NOMBRE }))
                                    ]}
                                />
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

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-3">
                        <Button onClick={handleGenerar} disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Generar Reporte'}
                        </Button>
                        {data && (
                            <Button variant="secondary" onClick={() => window.print()}>
                                Imprimir / PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg print:hidden">
                    {error}
                </div>
            )}

            {!data && !isLoading && (
                <div className="text-center py-20 text-slate-400 print:hidden">
                    Seleccione los filtros y haga clic en "Generar Reporte".
                </div>
            )}

            {/* Reporte */}
            {data && (
                <div className="max-w-3xl mx-auto border border-slate-200 p-10 print:border-none print:p-0">

                    {/* Encabezado */}
                    <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-xl font-bold uppercase tracking-wide">Sistema de Contabilidad</h1>
                        <h2 className="text-2xl font-bold uppercase mt-1">Estado de Resultados</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {filtroModo === 'periodo' ? `Del 01 al ${diasMes} de ${labelMes} de ${anio}` : `Del ${formatFechaStr(fechaInicio)} al ${formatFechaStr(fechaFin)}`}
                        </p>
                        <p className="text-xs italic text-slate-400 mt-1">
                            (Cifras expresadas en Quetzales — ISR calculado al 25% según Decreto 10-2012 Guatemala)
                        </p>
                    </div>

                    {/* ── INGRESOS ── */}
                    <Seccion titulo="INGRESOS OPERATIVOS">
                        {ingresos.map(r => (
                            <FilaCuenta key={r.CODIGO_CUENTA}
                                codigo={r.CODIGO_CUENTA}
                                nombre={r.NOMBRE_CUENTA}
                                monto={parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)}
                                fmt={fmt}
                            />
                        ))}
                        <FilaTotal label="TOTAL INGRESOS" monto={totalIngresos} fmt={fmt} color="text-emerald-800" />
                    </Seccion>

                    {/* ── GASTOS OPERATIVOS ── */}
                    <Seccion titulo="GASTOS Y COSTOS OPERATIVOS">
                        {gastosNormales.map(r => (
                            <FilaCuenta key={r.CODIGO_CUENTA}
                                codigo={r.CODIGO_CUENTA}
                                nombre={r.NOMBRE_CUENTA}
                                monto={parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)}
                                fmt={fmt}
                            />
                        ))}
                        <FilaTotal label="TOTAL GASTOS OPERATIVOS" monto={totalGastos} fmt={fmt} color="text-red-800" />
                    </Seccion>

                    {/* ── DEPRECIACIONES ── */}
                    {depreciaciones.length > 0 && (
                        <Seccion titulo="DEPRECIACIONES Y AMORTIZACIONES">
                            {depreciaciones.map(r => (
                                <FilaCuenta key={r.CODIGO_CUENTA}
                                    codigo={r.CODIGO_CUENTA}
                                    nombre={r.NOMBRE_CUENTA}
                                    monto={parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)}
                                    fmt={fmt}
                                />
                            ))}
                            <FilaTotal label="TOTAL DEPRECIACIONES" monto={totalDepreciacion} fmt={fmt} color="text-amber-800" />
                        </Seccion>
                    )}

                    {/* ── UTILIDAD ANTES DE IMPUESTOS ── */}
                    <div className="flex justify-between items-center py-3 px-2 border-t-2 border-b border-slate-400 my-2 font-semibold text-slate-800">
                        <span>UTILIDAD ANTES DE IMPUESTOS</span>
                        <span className="font-mono">{fmt(utilidadAntesISR)}</span>
                    </div>

                    {/* ── IMPUESTOS ── */}
                    <Seccion titulo="IMPUESTOS">
                        {/* ISR Guatemala — 25% Decreto 10-2012 */}
                        <div className="flex justify-between items-center px-2 py-1 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">ISR</span>
                                Impuesto Sobre la Renta (25% — Decreto 10-2012)
                            </span>
                            <span className="font-mono text-red-600">{fmt(isr)}</span>
                        </div>

                        <FilaTotal label="TOTAL IMPUESTOS" monto={isr} fmt={fmt} color="text-red-800" />
                    </Seccion>

                    {/* ── RESULTADO FINAL ── */}
                    <div className={`mt-6 p-5 rounded-lg flex justify-between items-center ${
                        utilidadNeta >= 0
                            ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'
                            : 'bg-red-50 border-2 border-red-400 text-red-900'
                    }`}>
                        <div>
                            <p className="text-xl font-bold uppercase">
                                {utilidadNeta >= 0 ? 'Utilidad Neta del Ejercicio' : 'Pérdida Neta del Ejercicio'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-70">
                                {utilidadNeta >= 0 ? 'Después de ISR' : 'Resultado negativo del período'}
                            </p>
                        </div>
                        <span className="text-2xl font-bold font-mono underline decoration-double">
                            {fmt(Math.abs(utilidadNeta))}
                        </span>
                    </div>

                    {/* Firmas */}
                    <div className="mt-20 grid grid-cols-2 gap-20 text-center text-slate-900">
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold">Contador General</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>

                        {/* Firmas */}
                        <div className="mt-16 grid grid-cols-2 gap-20 text-center text-zinc-900 text-sm">
                            <div className="border-t border-zinc-900 pt-2">
                                <p className="font-semibold">Contador General</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Firma y Sello</p>
                            </div>
                            <div className="border-t border-zinc-900 pt-2">
                                <p className="font-semibold">Representante Legal</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Firma y Sello</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Componentes auxiliares ──
const Seccion = ({ titulo, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold border-b border-slate-300 mb-3 uppercase tracking-wide text-slate-700 pb-1">
            {titulo}
        </h3>
        <div className="space-y-1">{children}</div>
    </div>
);

const FilaCuenta = ({ codigo, nombre, monto, fmt }) => (
    <div className="flex justify-between items-center px-2 py-0.5 text-sm text-slate-700">
        <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 w-16 shrink-0">{codigo}</span>
            {nombre}
        </span>
        <span className="font-mono shrink-0 ml-4">{fmt(monto)}</span>
    </div>
);

const FilaTotal = ({ label, monto, fmt, color = 'text-slate-900' }) => (
    <div className={`flex justify-between items-center border-t border-slate-900 pt-2 font-bold mt-3 px-2 ${color}`}>
        <span>{label}</span>
        <span className="font-mono border-b-2 border-current">{fmt(monto)}</span>
    </div>
);

export default EstadoResultadosReporte;