
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const MESES = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

const LibroDiarioReporte = () => {
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [filtroModo, setFiltroModo] = useState('periodo'); // 'periodo' o 'fecha'
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cuentaId, setCuentaId] = useState('');
    const [cuentaInicio, setCuentaInicio] = useState('');
    const [cuentaFin, setCuentaFin] = useState('');
    const [centroCostoId, setCentroCostoId] = useState('');
    const [monedaId, setMonedaId] = useState('');
    const [tipoAsientoId, setTipoAsientoId] = useState('');
    const [estadoAsientoId, setEstadoAsientoId] = useState('');

    // Listas de catálogos
    const [anios, setAnios] = useState([]);
    const [centrosCosto, setCentrosCosto] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [tiposAsiento, setTiposAsiento] = useState([]);
    const [estadosAsiento, setEstadosAsiento] = useState([]);
    const [cuentas, setCuentas] = useState([]);

    const [data, setData] = useState(null);      // null = sin consulta, [] = sin resultados
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

    const contentRef = useRef(null);
    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resAnios, resCC, resMon, resTipo, resEst, resCue] = await Promise.all([
                    axios.get('http://localhost:5000/api/reportes/libro-diario/anios'),
                    axios.get('http://localhost:5000/api/con-centro-costo'),
                    axios.get('http://localhost:5000/api/con-moneda'),
                    axios.get('http://localhost:5000/api/con-tipo-asiento'),
                    axios.get('http://localhost:5000/api/con-estado-asiento'),
                    axios.get('http://localhost:5000/api/con-cuenta'),
                ]);
                setAnios(resAnios.data);
                setCentrosCosto(resCC.data);
                setMonedas(resMon.data);
                setTiposAsiento(resTipo.data);
                setEstadosAsiento(resEst.data);
                setCuentas(resCue.data.sort((a, b) => a.CUE_CODIGO.localeCompare(b.CUE_CODIGO)));
            } catch (err) {
                console.error('Error al obtener catálogos:', err);
            }
        };
        fetchInitialData();
    }, []);

    const API_URL = 'http://localhost:5000/api/reportes/libro-diario';

    const handleGenerar = async () => {
        if (filtroModo === 'periodo' && (!anio || !mes)) {
            setError('Debe seleccionar un año y un mes.');
            return;
        }
        if (filtroModo === 'fecha' && (!fechaInicio || !fechaFin)) {
            setError('Debe ingresar el rango de fechas (Inicio y Fin).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setData(null);

        const params = {};
        if (filtroModo === 'periodo') {
            params.anio = anio;
            params.mes = mes;
        } else {
            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;
        }

        if (cuentaId) params.cuentaId = cuentaId;
        if (cuentaInicio) params.cuentaInicio = cuentaInicio;
        if (cuentaFin) params.cuentaFin = cuentaFin;
        if (centroCostoId) params.centroCostoId = centroCostoId;
        if (monedaId) params.monedaId = monedaId;
        if (tipoAsientoId) params.tipoAsientoId = tipoAsientoId;
        if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

        try {
            const res = await axios.get(API_URL, { params });
            setData(res.data);
        } catch (err) {
            const textoError = err.response?.data?.error || err.message;
            setError(`Error al consultar el reporte: ${textoError}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Formatear fecha legible ──
    const formatFecha = (valor) => {
        if (!valor) return '';
        const d = new Date(valor);
        return d.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // ── Agrupación por Partida (NUMERO_POLIZA) ──
    const partidas = data
        ? Object.values(
            data.reduce((acc, row) => {
                const key = row.NUMERO_POLIZA;
                if (!acc[key]) {
                    acc[key] = {
                        numero: key,
                        fecha: row.FECHA_POLIZA,
                        descripcion: row.DESCRIPCION,
                        detalles: [],
                        totalDebe: 0,
                        totalHaber: 0,
                    };
                }
                acc[key].detalles.push(row);
                acc[key].totalDebe += parseFloat(row.DEBE) || 0;
                acc[key].totalHaber += parseFloat(row.HABER) || 0;
                return acc;
            }, {})
        )
        : [];

    // ── Gran Total del mes ──
    const granTotalDebe = partidas.reduce((acc, p) => acc + p.totalDebe, 0);
    const granTotalHaber = partidas.reduce((acc, p) => acc + p.totalHaber, 0);

    return (
        <div className="bg-white border border-zinc-200 rounded-lg print:shadow-none print:rounded-none print:border-none">
            {/* ── Header y Filtros ── */}
            <div className="px-6 py-5 border-b border-zinc-200 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        Reporte de Libro Diario
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

                {/* Filtros Principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filtroModo === 'periodo' ? (
                        <>
                            <Select
                                label="Año"
                                name="anio"
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                options={anios}
                            />
                            <Select
                                label="Mes"
                                name="mes"
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                options={MESES}
                            />
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
                                label="Tipo de Asiento"
                                value={tipoAsientoId}
                                onChange={(e) => setTipoAsientoId(e.target.value)}
                                options={[
                                    { value: '', label: 'Todos los tipos' },
                                    ...tiposAsiento.map(t => ({ value: String(t.TPA_TIPO_ASIENTO), label: t.TPA_DESCRIPCION }))
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
                            <Select
                                label="Filtrar por Cuenta Específica"
                                value={cuentaId}
                                onChange={(e) => setCuentaId(e.target.value)}
                                options={[
                                    { value: '', label: 'Todas las cuentas' },
                                    ...cuentas.map(c => ({ value: String(c.CUE_CUENTA), label: `${c.CUE_CODIGO} - ${c.CUE_NOMBRE}` }))
                                ]}
                            />
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Rango Cuentas (Código Inicio)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1101"
                                    value={cuentaInicio}
                                    onChange={(e) => setCuentaInicio(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-sky-500 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Rango Cuentas (Código Fin)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1105"
                                    value={cuentaFin}
                                    onChange={(e) => setCuentaFin(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-sky-500 bg-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-150 pt-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar Libro Diario'}
                    </Button>
                    {data && data.length > 0 && (
                        <Button variant="secondary" onClick={handlePrint}>
                            Exportar a PDF / Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="mx-6 my-3 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm print:hidden">
                    {error}
                </div>
            )}

            {/* ── Loading spinner ── */}
            {isLoading && (
                <div className="flex justify-center py-16 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* ── Mensaje vacío ── */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-6 my-3 px-4 py-3 rounded border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-center gap-2 print:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 2.99-1.742 2.99H3.481c-1.53 0-2.493-1.656-1.742-2.99l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span>No existen registros contables validados para el periodo seleccionado.</span>
                </div>
            )}

            {/* ── Tabla de resultados agrupada por Partida ── */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="px-6 pb-8 print:px-4 print:pb-4">
                    {/* ── Encabezado visible solo al imprimir ── */}
                    <div className="hidden print:block text-center mb-6 pt-4">
                        <h2 className="text-xl font-bold text-slate-900">Reporte de Libro Diario</h2>
                        <p className="text-sm text-slate-600">
                            Periodo: {filtroModo === 'periodo' ? `${MESES.find(m => m.value === mes)?.label || mes} - ${anio}` : `Del ${formatFecha(fechaInicio)} al ${formatFecha(fechaFin)}`}
                        </p>
                        <p className="text-xs italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                    </div>

                    <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                        <table className="w-full border-collapse text-sm table-fixed">
                            <colgroup>
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '52%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '20%' }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Código</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cuenta</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Debe</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Haber</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {partidas.map((partida) => (
                                    <React.Fragment key={partida.numero}>
                                        {/* ── Fila de Cabecera de Partida (break-inside-avoid para no cortar entre páginas) ── */}
                                        <tr className="bg-zinc-50 border-b border-zinc-200 break-inside-avoid print:break-inside-avoid">
                                            <td colSpan={4} className="px-3 py-2 text-sm text-zinc-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-zinc-900">
                                                        Partida No. {partida.numero}
                                                    </span>
                                                    <span className="text-zinc-500 text-xs">
                                                        {formatFecha(partida.fecha)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Filas de Detalle ── */}
                                        {partida.detalles.map((det, idx) => {
                                            const esAbono = parseFloat(det.HABER) > 0;
                                            return (
                                                <tr
                                                    key={`${partida.numero}-${idx}`}
                                                    className="bg-white hover:bg-zinc-50 transition-colors break-inside-avoid print:break-inside-avoid"
                                                >
                                                    <td className="px-3 py-2 text-sm font-mono text-zinc-700 whitespace-nowrap">
                                                        {det.CODIGO_CUENTA}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-zinc-700 truncate">{/* ${esAbono ? 'pl-8' : ''}*/}
                                                        {det.NOMBRE_CUENTA}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-mono text-zinc-700 text-right whitespace-nowrap">
                                                        {parseFloat(det.DEBE || 0) > 0
                                                            ? 'Q ' + parseFloat(det.DEBE).toFixed(2)
                                                            : ''}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-mono text-zinc-700 text-right whitespace-nowrap">
                                                        {parseFloat(det.HABER || 0) > 0
                                                            ? 'Q ' + parseFloat(det.HABER).toFixed(2)
                                                            : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* ── Fila de Cierre: Glosa + Sumas de la Partida ── */}
                                        <tr className="bg-zinc-50 border-t border-zinc-200 font-semibold break-inside-avoid print:break-inside-avoid">
                                            <td colSpan={2} className="px-3 py-2 text-sm text-zinc-700 italic">
                                                {partida.descripcion}
                                            </td>
                                            <td
                                                className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap"
                                                style={{ borderTop: '3px double #94a3b8' }}
                                            >
                                                Q {partida.totalDebe.toFixed(2)}
                                            </td>
                                            <td
                                                className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap"
                                                style={{ borderTop: '3px double #94a3b8' }}
                                            >
                                                Q {partida.totalHaber.toFixed(2)}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>

                            {/* ── Gran Total del Mes ── */}
                            <tfoot>
                                <tr className="bg-zinc-50 border-t border-zinc-200 font-semibold">
                                    <td colSpan={2} className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold">
                                        Gran Total:
                                    </td>
                                    <td
                                        className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap"
                                        style={{ borderTop: '3px double #334155' }}
                                    >
                                        Q {granTotalDebe.toFixed(2)}
                                    </td>
                                    <td
                                        className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap"
                                        style={{ borderTop: '3px double #334155' }}
                                    >
                                        Q {granTotalHaber.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibroDiarioReporte;
