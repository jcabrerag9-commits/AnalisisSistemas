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

const LibroIVAReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [filtroModo, setFiltroModo] = useState('periodo'); // 'periodo' o 'fecha'
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [impuestoId, setImpuestoId] = useState('');
    const [monedaId, setMonedaId] = useState('');
    const [estadoAsientoId, setEstadoAsientoId] = useState('');
    const [tab, setTab]             = useState('ventas'); // 'ventas' | 'compras'

    // Catalogos
    const [anios, setAnios]         = useState([]);
    const [impuestos, setImpuestos] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [estadosAsiento, setEstadosAsiento] = useState([]);

    const [data, setData]           = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resAnios, resImp, resMon, resEst] = await Promise.all([
                    axios.get('http://localhost:5000/api/reportes/libro-diario/anios'),
                    axios.get('http://localhost:5000/api/con-impuesto'),
                    axios.get('http://localhost:5000/api/con-moneda'),
                    axios.get('http://localhost:5000/api/con-estado-asiento'),
                ]);
                setAnios(resAnios.data);
                setImpuestos(resImp.data);
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

            if (impuestoId) params.impuestoId = impuestoId;
            if (monedaId) params.monedaId = monedaId;
            if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

            const res = await axios.get(
                'http://localhost:5000/api/reportes/libro-iva',
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

    // Formatea una fecha 'YYYY-MM-DD' sin desfase de zona horaria
    const formatFechaLocal = (str) => {
        if (!str) return '';
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    };

    const labelPeriodo = filtroModo === 'periodo'
        ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}`
        : `Del ${formatFechaLocal(fechaInicio)} al ${formatFechaLocal(fechaFin)}`;

    const filas     = data ? (tab === 'ventas' ? data.ventas : data.compras) : [];
    const totalBase = filas.reduce((s, r) => s + (parseFloat(r.BASE_IMPONIBLE) || 0), 0);
    const totalIVA  = filas.reduce((s, r) => s + (parseFloat(r.MONTO_IMPUESTO) || 0), 0);
    const totalDoc  = filas.reduce((s, r) => s + (parseFloat(r.TOTAL_DOCUMENTO) || 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-md print:shadow-none print:rounded-none">

            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center md:text-left">
                        Libro de Compras y Ventas — IVA
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
                    Registro de IVA Débito Fiscal (ventas) e IVA Crédito Fiscal (compras) — Decreto 27-92 Guatemala
                </p>
            </div>

            {/* Filtros */}
            <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filtroModo === 'periodo' ? (
                        <>
                            <Select label="Año *"  value={anio} onChange={e => setAnio(e.target.value)} options={anios} />
                            <Select label="Mes *"  value={mes}  onChange={e => setMes(e.target.value)}  options={MESES} />
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
                                label="Impuesto Específico"
                                value={impuestoId}
                                onChange={(e) => setImpuestoId(e.target.value)}
                                options={[
                                    { value: '', label: 'Todos los impuestos' },
                                    ...impuestos.map(i => ({ value: String(i.IMP_IMPUESTO), label: `${i.IMP_CODIGO} - ${i.IMP_NOMBRE}` }))
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
                <div className="px-8 pb-8 print:px-4 print:pb-4">

                    {/* Resumen IVA Líquido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
                        <TarjetaIVA label="IVA Débito Fiscal (Ventas)"  monto={data.resumen.totalIVAVentas}  color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                        <TarjetaIVA label="IVA Crédito Fiscal (Compras)" monto={data.resumen.totalIVACompras} color="text-sky-700 bg-sky-50 border-sky-200" />
                        <TarjetaIVA
                            label="IVA Líquido a Pagar"
                            monto={data.resumen.ivaLiquido}
                            color={data.resumen.ivaLiquido >= 0
                                ? "text-red-700 bg-red-50 border-red-300 font-bold"
                                : "text-green-700 bg-green-50 border-green-300 font-bold"}
                            fmt={fmt}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 border-b border-slate-200 print:hidden">
                        {['ventas', 'compras'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                                    tab === t
                                        ? 'border-sky-500 text-sky-600 bg-sky-50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}>
                                {t === 'ventas' ? `📤 Libro de Ventas (${data.ventas.length})` : `📥 Libro de Compras (${data.compras.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Encabezado impresión */}
                    <div className="hidden print:block text-center mb-6 pt-4">
                        <h2 className="text-xl font-bold">
                            {tab === 'ventas' ? 'Libro de Ventas — Débito Fiscal' : 'Libro de Compras — Crédito Fiscal'}
                        </h2>
                        <p className="text-sm text-slate-600">Período: {labelPeriodo}</p>
                        <p className="text-xs italic text-slate-500">(Decreto 27-92 — Ley del IVA Guatemala)</p>
                    </div>

                    {filas.length === 0 ? (
                        <div className="px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-300">
                            No hay registros de {tab === 'ventas' ? 'ventas' : 'compras'} en el período seleccionado.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-800 text-white text-xs text-center">
                                        <th className="px-3 py-3 text-left border border-slate-600">Fecha</th>
                                        <th className="px-3 py-3 text-left border border-slate-600">No. Póliza</th>
                                        <th className="px-3 py-3 text-left border border-slate-600">Descripción</th>
                                        <th className="px-3 py-3 border border-slate-600">Impuesto</th>
                                        <th className="px-3 py-3 border border-slate-600">Base Imponible</th>
                                        <th className="px-3 py-3 border border-slate-600">IVA</th>
                                        <th className="px-3 py-3 border border-slate-600">Total Documento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filas.map((r, i) => (
                                        <tr key={i} className={`border-b border-slate-200 hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                {r.FECHA ? new Date(r.FECHA).toLocaleDateString('es-GT') : ''}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-center text-slate-500">{r.NO_POLIZA}</td>
                                            <td className="px-3 py-2 text-slate-700">{r.DESCRIPCION}</td>
                                            <td className="px-3 py-2 text-center text-xs text-slate-500">{r.CODIGO_IMPUESTO}</td>
                                            <td className="px-3 py-2 text-right font-mono">{fmt(r.BASE_IMPONIBLE)}</td>
                                            <td className="px-3 py-2 text-right font-mono text-sky-700">{fmt(r.MONTO_IMPUESTO)}</td>
                                            <td className="px-3 py-2 text-right font-mono font-medium">{fmt(r.TOTAL_DOCUMENTO)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-800 text-white font-bold text-sm">
                                        <td colSpan={4} className="px-3 py-3 text-right border-t-2 border-slate-600">TOTALES:</td>
                                        <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600">{fmt(totalBase)}</td>
                                        <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600">{fmt(totalIVA)}</td>
                                        <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600">{fmt(totalDoc)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TarjetaIVA = ({ label, monto, color, fmt }) => {
    const f = fmt || ((n) => 'Q ' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    return (
        <div className={`p-4 rounded-lg border ${color}`}>
            <p className="text-xs font-medium mb-1 opacity-80">{label}</p>
            <p className="text-xl font-bold font-mono">{f(monto)}</p>
        </div>
    );
};

export default LibroIVAReporte;