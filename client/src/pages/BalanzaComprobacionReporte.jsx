import React, { useState, useEffect, useRef } from 'react';
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

const BalanzaComprobacionReporte = () => {
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

    const contentRef = useRef(null);
    const handlePrint = () => window.print();

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

            if (centroCostoId) params.centroCostoId = centroCostoId;
            if (monedaId) params.monedaId = monedaId;
            if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

            const res = await axios.get(
                'http://localhost:5000/api/reportes/balanza-comprobacion',
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
        (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Totales generales ──
    const totales = data ? data.reduce((acc, row) => ({
        debe:     acc.debe     + (parseFloat(row.TOTAL_DEBE)     || 0),
        haber:    acc.haber    + (parseFloat(row.TOTAL_HABER)    || 0),
        deudor:   acc.deudor   + (parseFloat(row.SALDO_DEUDOR)   || 0),
        acreedor: acc.acreedor + (parseFloat(row.SALDO_ACREEDOR) || 0),
    }), { debe: 0, haber: 0, deudor: 0, acreedor: 0 }) : null;

    const cuadra = totales
        ? Math.abs(totales.debe - totales.haber) < 0.01 &&
          Math.abs(totales.deudor - totales.acreedor) < 0.01
        : false;

    const labelPeriodo = filtroModo === 'periodo'
        ? (mes ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}` : `Año ${anio}`)
        : `Del ${fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-HN') : ''} al ${fechaFin ? new Date(fechaFin).toLocaleDateString('es-HN') : ''}`;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 print:shadow-none print:rounded-none">

            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center md:text-left">
                        Balanza de Comprobación
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
                    Verifica que la suma del Debe sea igual a la suma del Haber en todos los asientos validados.
                </p>
            </div>

            {/* Filtros */}
            <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Filtros de consulta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filtroModo === 'periodo' ? (
                        <>
                            <Select label="Año *" name="anio" value={anio}
                                onChange={(e) => setAnio(e.target.value)} options={anios} />
                            <Select label="Mes (opcional — acumulado)" name="mes" value={mes}
                                onChange={(e) => setMes(e.target.value)} options={MESES} />
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

                <div className="flex justify-end gap-3 border-t border-slate-150 pt-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar Balanza'}
                    </Button>
                    {data && data.length > 0 && (
                        <Button variant="secondary" onClick={handlePrint}>
                            Exportar a PDF / Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-8 mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 print:hidden">
                    {error}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-12 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* Sin resultados */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-8 mb-6 px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-300 print:hidden">
                    No existen registros contables validados para el período seleccionado.
                </div>
            )}

            {/* Tabla */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="px-8 pb-8 print:px-4 print:pb-4 overflow-x-auto">

                    {/* Encabezado de impresión */}
                    <div className="hidden print:block text-center mb-6 pt-4">
                        <h2 className="text-xl font-bold">Balanza de Comprobación</h2>
                        <p className="text-sm text-slate-600">Período: {labelPeriodo}</p>
                        <p className="text-xs italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                    </div>

                    {/* Indicador de cuadre */}
                    <div className={`mb-5 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 print:hidden ${
                        cuadra
                            ? 'bg-green-50 text-green-800 border border-green-300'
                            : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                        {cuadra
                            ? '✅ Balanza cuadra — La contabilidad está correcta'
                            : `⚠️ Balanza NO cuadra — Diferencia en Saldos: Q ${fmt(Math.abs(totales.deudor - totales.acreedor))}`
                        }
                    </div>

                    <table className="w-full border-collapse text-sm print:text-black">
                        <thead>
                            <tr className="bg-slate-800 text-white text-center text-xs">
                                {/* Grupo: Identificación */}
                                <th rowSpan={2} className="px-3 py-3 text-left border border-slate-600" style={{ width: '80px' }}>Código</th>
                                <th rowSpan={2} className="px-3 py-3 text-left border border-slate-600">Cuenta</th>
                                <th rowSpan={2} className="px-3 py-3 border border-slate-600" style={{ width: '90px' }}>Tipo</th>
                                {/* Grupo: Movimientos */}
                                <th colSpan={2} className="px-3 py-2 border border-slate-600 bg-blue-800">Movimientos del Período</th>
                                {/* Grupo: Saldos */}
                                <th colSpan={2} className="px-3 py-2 border border-slate-600 bg-indigo-800">Saldos</th>
                            </tr>
                            <tr className="text-xs text-center">
                                <th className="px-3 py-2 border border-slate-600 bg-blue-700" style={{ width: '110px' }}>Debe</th>
                                <th className="px-3 py-2 border border-slate-600 bg-blue-700" style={{ width: '110px' }}>Haber</th>
                                <th className="px-3 py-2 border border-slate-600 bg-indigo-700" style={{ width: '110px' }}>Deudor</th>
                                <th className="px-3 py-2 border border-slate-600 bg-indigo-700" style={{ width: '110px' }}>Acreedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr
                                    key={row.CODIGO_CUENTA}
                                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                    }`}
                                >
                                    <td className="px-3 py-2 font-mono text-xs text-slate-500 border-r border-slate-200">
                                        {row.CODIGO_CUENTA}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 border-r border-slate-200">
                                        {row.NOMBRE_CUENTA}
                                    </td>
                                    <td className="px-3 py-2 text-center border-r border-slate-200">
                                        <span style={{
                                            fontSize: '10px', fontWeight: '600',
                                            padding: '2px 7px', borderRadius: '20px',
                                            background: getTipoBg(row.TIPO_CUENTA),
                                            color: getTipoColor(row.TIPO_CUENTA),
                                        }}>
                                            {row.TIPO_CUENTA}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-700 border-r border-slate-200">
                                        {parseFloat(row.TOTAL_DEBE) > 0 ? fmt(row.TOTAL_DEBE) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-700 border-r border-slate-200">
                                        {parseFloat(row.TOTAL_HABER) > 0 ? fmt(row.TOTAL_HABER) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-medium text-blue-700 border-r border-slate-200">
                                        {parseFloat(row.SALDO_DEUDOR) > 0 ? fmt(row.SALDO_DEUDOR) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-medium text-indigo-700">
                                        {parseFloat(row.SALDO_ACREEDOR) > 0 ? fmt(row.SALDO_ACREEDOR) : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        {/* Totales */}
                        {totales && (
                            <tfoot>
                                <tr className="bg-slate-800 text-white font-bold">
                                    <td colSpan={3} className="px-3 py-3 text-right text-sm border-t-2 border-slate-600">
                                        TOTALES:
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.debe)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.haber)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.deudor)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.acreedor)}
                                    </td>
                                </tr>
                                {/* Verificación visual de cuadre */}
                                <tr className={cuadra ? 'bg-green-700' : 'bg-red-700'}>
                                    <td colSpan={7} className="px-3 py-2 text-center text-white text-xs font-semibold print:hidden">
                                        {cuadra
                                            ? '✓ Debe = Haber   |   Saldo Deudor = Saldo Acreedor'
                                            : '✗ Los totales no cuadran — Revisar asientos'
                                        }
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    {/* Firmas al imprimir */}
                    <div className="hidden print:grid print:grid-cols-2 print:gap-20 print:mt-16 print:text-center print:text-slate-900">
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

// Colores por tipo de cuenta
const getTipoBg = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'ACTIVO')   return '#dbeafe';
    if (t === 'PASIVO')   return '#fee2e2';
    if (t === 'CAPITAL' || t === 'PATRIMONIO') return '#dcfce7';
    if (t === 'INGRESO')  return '#fef9c3';
    if (t === 'GASTO')    return '#fce7f3';
    return '#f1f5f9';
};
const getTipoColor = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'ACTIVO')   return '#1e40af';
    if (t === 'PASIVO')   return '#991b1b';
    if (t === 'CAPITAL' || t === 'PATRIMONIO') return '#166534';
    if (t === 'INGRESO')  return '#854d0e';
    if (t === 'GASTO')    return '#9d174d';
    return '#475569';
};

export default BalanzaComprobacionReporte;
